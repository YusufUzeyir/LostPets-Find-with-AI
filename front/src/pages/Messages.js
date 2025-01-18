import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';

const Messages = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState('');
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const receiverEmail = location.state?.receiver || userId;
    if (receiverEmail) {
      setReceiver(receiverEmail);
    }

    const fetchMessages = async () => {
      try {
        if (!user?.user?.email) return;

        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/messages/user/${user.user.email}`);
        if (!response.ok) {
          throw new Error('Mesajlar alınırken bir hata oluştu');
        }
        const data = await response.json();
        
        // Mesajları tarihe göre sırala ve süre hesapla
        const sortedMessages = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const newTimeLeft = {};
        sortedMessages.forEach(msg => {
          const expiresAt = new Date(new Date(msg.created_at).getTime() + 24 * 60 * 60 * 1000);
          const now = new Date();
          const diff = expiresAt - now;
          newTimeLeft[msg.id] = Math.max(0, Math.floor(diff / 1000));
        });
        setTimeLeft(newTimeLeft);
        setMessages(sortedMessages);

        // Okunmamış mesajları işaretle
        const unreadMessages = data.filter(msg => !msg.is_read && msg.receiver_email === user.user.email);
        if (unreadMessages.length > 0) {
          for (const msg of unreadMessages) {
            await fetch(`http://localhost:5000/api/messages/mark-read/${msg.id}`, {
              method: 'PUT'
            });
          }
        }

        setError(null);
      } catch (error) {
        console.error('Mesajlar alınamadı:', error);
        setError('Mesajlar alınırken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.user?.email) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [user, navigate, location, userId]);

  // Geri sayım için timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        const newTimeLeft = { ...prevTimeLeft };
        Object.keys(newTimeLeft).forEach(id => {
          if (newTimeLeft[id] > 0) {
            newTimeLeft[id] -= 1;
          }
        });
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Kalan süreyi formatla
  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return 'Mesaj silinecek';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!user?.user?.email) {
      navigate('/login');
      return;
    }

    if (!newMessage.trim() || !receiver.trim()) {
      Swal.fire({
        title: 'Hata!',
        text: 'Lütfen mesaj ve alıcı bilgilerini doldurun.',
        icon: 'error',
        confirmButtonColor: '#f50057'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_email: user.user.email,
          receiver_email: receiver,
          message: newMessage
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage('');
        // Mesajları güncelle
        const messagesResponse = await fetch(`http://localhost:5000/api/messages/user/${user.user.email}`);
        const messagesData = await messagesResponse.json();
        const sortedMessages = messagesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setMessages(sortedMessages);

        Swal.fire({
          title: 'Başarılı!',
          text: 'Mesajınız gönderildi.',
          icon: 'success',
          confirmButtonColor: '#2196f3'
        });
      } else {
        throw new Error(data.message || 'Mesaj gönderilemedi');
      }
    } catch (error) {
      Swal.fire({
        title: 'Hata!',
        text: error.message || 'Mesaj gönderilemedi.',
        icon: 'error',
        confirmButtonColor: '#f50057'
      });
    }
  };

  const handleDeleteConversation = async (otherEmail) => {
    try {
      Swal.fire({
        title: 'Emin misiniz?',
        text: 'Bu kişiyle olan tüm mesajlarınız silinecek!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f50057',
        cancelButtonColor: '#2196f3',
        confirmButtonText: 'Evet, sil',
        cancelButtonText: 'İptal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await fetch(
            `http://localhost:5000/api/messages/conversation/${user.user.email}/${otherEmail}`,
            { method: 'DELETE' }
          );

          if (response.ok) {
            // Mesajları listeden kaldır
            setMessages(messages.filter(msg => 
              !(msg.sender_email === otherEmail || msg.receiver_email === otherEmail)
            ));

            Swal.fire(
              'Silindi!',
              'Mesajlar başarıyla silindi.',
              'success'
            );

            // Eğer şu an silinen konuşmayı görüntülüyorsak ana sayfaya dön
            if (receiver === otherEmail) {
              navigate('/messages', { state: { showAll: true } });
            }
          } else {
            throw new Error('Mesajlar silinirken bir hata oluştu');
          }
        }
      });
    } catch (error) {
      Swal.fire({
        title: 'Hata!',
        text: error.message || 'Mesajlar silinirken bir hata oluştu.',
        icon: 'error',
        confirmButtonColor: '#f50057'
      });
    }
  };

  // Kullanıcı girişi yapılmamışsa yükleniyor göster
  if (!user) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </Button>
        </Paper>
      </Container>
    );
  }

  // Eğer belirli bir alıcıyla konuşma varsa, sadece o konuşmayı göster
  const filteredMessages = location.state?.receiver
    ? messages.filter(msg => msg.sender_email === receiver || msg.receiver_email === receiver)
    : messages;

  // Mesajları tarihe göre grupla
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString('tr-TR');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Mesajları gönderici adına göre grupla (tüm mesajlar görünümü için)
  const groupedByUser = messages.reduce((groups, message) => {
    const otherUser = message.sender_email === user.user.email ? message.receiver_email : message.sender_email;
    const otherUserName = message.sender_email === user.user.email ? message.receiver_name : message.sender_name;
    
    if (!groups[otherUser]) {
      groups[otherUser] = {
        name: otherUserName,
        messages: []
      };
    }
    groups[otherUser].messages.push(message);
    return groups;
  }, {});

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {location.state?.receiver ? (
              `${messages.find(m => 
                m.sender_email === receiver || m.receiver_email === receiver
              )?.sender_email === receiver ? 
                messages.find(m => m.sender_email === receiver)?.sender_name : 
                messages.find(m => m.receiver_email === receiver)?.receiver_name
              } ile Mesajlaşma`
            ) : (
              'Mesajlarım'
            )}
          </Typography>
          <Alert severity="info" icon={<AccessTimeIcon />} sx={{ mb: 2 }}>
            Mesajlar 24 saat sonra otomatik olarak silinecektir.
          </Alert>
        </Box>

        {location.state?.showAll ? (
          // Tüm mesajları kullanıcılara göre gruplandırarak göster
          <List>
            {Object.entries(groupedByUser).map(([email, userData]) => (
              <React.Fragment key={email}>
                <ListItem 
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: '#e0e0e0'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box 
                      sx={{ 
                        flex: 1, 
                        cursor: 'pointer' 
                      }}
                      onClick={() => navigate('/messages', { state: { receiver: email } })}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {userData.name || email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userData.messages[userData.messages.length - 1].message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(userData.messages[userData.messages.length - 1].created_at).toLocaleString('tr-TR')}
                      </Typography>
                    </Box>
                    <Button
                      color="error"
                      onClick={() => handleDeleteConversation(email)}
                      sx={{ minWidth: 'auto', ml: 2 }}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          // Mesajlaşma görünümü
          <>
            {!location.state?.receiver && (
              <Box sx={{ mb: 4 }}>
                <form onSubmit={handleSendMessage}>
                  <TextField
                    fullWidth
                    label="Alıcı E-posta"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    margin="normal"
                    required
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Mesajınız"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      multiline
                      rows={2}
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      sx={{ minWidth: '120px' }}
                    >
                      Gönder
                    </Button>
                  </Box>
                </form>
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              <form onSubmit={handleSendMessage}>
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Mesajınız"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    multiline
                    rows={2}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    sx={{ minWidth: '120px' }}
                  >
                    Gönder
                  </Button>
                </Box>
              </form>
            </Box>

            <Divider sx={{ my: 3 }} />

            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <Box key={date} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  {date}
                </Typography>
                <List>
                  {dateMessages.map((message) => (
                    <React.Fragment key={message.id}>
                      <ListItem alignItems="flex-start">
                        <Box
                          sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.sender_email === user.user.email ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: '70%',
                              backgroundColor: message.sender_email === user.user.email ? '#e3f2fd' : '#f5f5f5',
                              borderRadius: 2,
                              p: 2
                            }}
                          >
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {message.sender_email === user.user.email ? 'Ben' : message.sender_name}
                            </Typography>
                            <Typography variant="body1">
                              {message.message}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(message.created_at).toLocaleTimeString('tr-TR')}
                              </Typography>
                              <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <AccessTimeIcon fontSize="small" />
                                {formatTimeLeft(timeLeft[message.id])}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            ))}

            {filteredMessages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {receiver ? 'Bu kişiyle henüz mesajlaşmanız yok.' : 'Henüz hiç mesajınız yok.'}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Messages; 
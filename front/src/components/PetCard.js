import React from 'react';
import { Card, CardContent, CardMedia, Typography, Avatar, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  margin: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const UserInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PetCard = ({ pet }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMessageClick = () => {
    if (!user) {
      Swal.fire({
        title: 'Giriş Gerekli!',
        text: 'Mesaj göndermek için önce giriş yapmalısınız.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2196f3',
        cancelButtonColor: '#f50057',
        confirmButtonText: 'Giriş Yap',
        cancelButtonText: 'İptal',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    
    navigate(`/messages/${pet.userId}`);
  };

  return (
    <StyledCard>
      <UserInfo>
        <Avatar
          src={pet.user?.profileImage}
          alt={pet.user?.name}
          sx={{ width: 40, height: 40, marginRight: 2 }}
        />
        <Typography variant="subtitle1">
          {pet.user?.name || 'İsimsiz Kullanıcı'}
        </Typography>
      </UserInfo>
      <CardMedia
        component="img"
        height="200"
        image={pet.imageUrl || 'https://via.placeholder.com/400x300'}
        alt={pet.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {pet.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tür: {pet.type}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cins: {pet.breed}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kaybolduğu Yer: {pet.location}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kaybolma Tarihi: {new Date(pet.lostDate).toLocaleDateString('tr-TR')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {pet.description}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EmailIcon />}
          onClick={handleMessageClick}
          sx={{ mt: 2, width: '100%' }}
        >
          Mesaj Gönder
        </Button>
      </CardContent>
    </StyledCard>
  );
};

export default PetCard; 
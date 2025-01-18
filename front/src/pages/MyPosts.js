import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

const MyPosts = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [lostPets, setLostPets] = useState([]);
  const [foundPets, setFoundPets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tur: '',
    cins: '',
    cinsiyet: '',
    sehir: '',
    ilce: '',
    kaybolma_tarihi: null,
    description: ''
  });
  const [types, setTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user?.email) {
        navigate('/login');
        return;
      }

      try {
        // Türleri getir
        const typesResponse = await fetch('http://localhost:5000/api/pets/types');
        const typesData = await typesResponse.json();
        setTypes(typesData);

        // Şehirleri getir
        const citiesResponse = await fetch('http://localhost:5000/api/pets/cities');
        const citiesData = await citiesResponse.json();
        setCities(citiesData);

        // Kullanıcının kayıp ilanlarını getir
        const lostResponse = await fetch(`http://localhost:5000/api/pets/user/lost/${user.user.email}`);
        const lostData = await lostResponse.json();
        setLostPets(lostData);

        // Kullanıcının buldum ilanlarını getir
        const foundResponse = await fetch(`http://localhost:5000/api/pets/user/found/${user.user.email}`);
        const foundData = await foundResponse.json();
        setFoundPets(foundData);

        setLoading(false);
      } catch (error) {
        console.error('İlanlar getirilemedi:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Tür değiştiğinde cinsleri getir
  useEffect(() => {
    const fetchBreeds = async () => {
      if (editFormData.tur) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/breeds/${editFormData.tur}`);
          const data = await response.json();
          setBreeds(data);
        } catch (error) {
          console.error('Cins getirme hatası:', error);
        }
      } else {
        setBreeds([]);
        setEditFormData(prev => ({ ...prev, cins: '' }));
      }
    };

    fetchBreeds();
  }, [editFormData.tur]);

  // Şehir değiştiğinde ilçeleri getir
  useEffect(() => {
    const fetchDistricts = async () => {
      if (editFormData.sehir) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/districts/${editFormData.sehir}`);
          const data = await response.json();
          setDistricts(data);
        } catch (error) {
          console.error('İlçe getirme hatası:', error);
        }
      } else {
        setDistricts([]);
        setEditFormData(prev => ({ ...prev, ilce: '' }));
      }
    };

    fetchDistricts();
  }, [editFormData.sehir]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteClick = (post, type) => {
    setSelectedPost({ ...post, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${selectedPost.type}/${selectedPost.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('İlan silinemedi');
      }

      // İlanı listeden kaldır
      if (selectedPost.type === 'lost') {
        setLostPets(prev => prev.filter(pet => pet.id !== selectedPost.id));
      } else {
        setFoundPets(prev => prev.filter(pet => pet.id !== selectedPost.id));
      }

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'İlan başarıyla silindi.',
      });
    } catch (error) {
      console.error('İlan silme hatası:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'İlan silinirken bir hata oluştu.',
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleCardClick = (id, type) => {
    navigate(`/pet/${type}/${id}`);
  };

  const handleEditClick = (post, type) => {
    setEditingPost({ ...post, type });
    setEditFormData({
      tur: post.tur,
      cins: post.cins,
      cinsiyet: post.cinsiyet,
      sehir: post.city_id,
      ilce: post.district_id,
      kaybolma_tarihi: type === 'lost' ? post.kaybolma_tarihi : null,
      description: post.description || ''
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${editingPost.type}/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        throw new Error('İlan güncellenemedi');
      }

      // İlanı listede güncelle
      const updatedPost = { ...editingPost, ...editFormData };
      if (editingPost.type === 'lost') {
        setLostPets(prev => prev.map(pet => 
          pet.id === editingPost.id ? updatedPost : pet
        ));
      } else {
        setFoundPets(prev => prev.map(pet => 
          pet.id === editingPost.id ? updatedPost : pet
        ));
      }

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'İlan başarıyla güncellendi.',
      });
      setEditDialogOpen(false);
    } catch (error) {
      console.error('İlan güncelleme hatası:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'İlan güncellenirken bir hata oluştu.',
      });
    }
  };

  const handleToggleActive = async (post, type) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${type}/${post.id}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('İlan durumu güncellenemedi');
      }

      // İlanı listede güncelle
      const updatePets = (prevPets) => 
        prevPets.map(pet => 
          pet.id === post.id ? { ...pet, active: !pet.active } : pet
        );

      if (type === 'lost') {
        setLostPets(updatePets);
      } else {
        setFoundPets(updatePets);
      }

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: `İlan ${!post.active ? 'aktif' : 'pasif'} duruma getirildi.`,
      });
    } catch (error) {
      console.error('İlan durumu güncelleme hatası:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'İlan durumu güncellenirken bir hata oluştu.',
      });
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          İlanlarım
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label={`Kayıp İlanlarım (${lostPets.length})`} />
            <Tab label={`Buldum İlanlarım (${foundPets.length})`} />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {(activeTab === 0 ? lostPets : foundPets).map((pet) => (
            <Grid item xs={12} sm={6} md={4} key={pet.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Box 
                  onClick={() => handleCardClick(pet.id, activeTab === 0 ? 'lost' : 'found')}
                  sx={{ cursor: 'pointer', flexGrow: 1 }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={activeTab === 0 ? pet.lost_image : pet.found_image}
                    alt={`${pet.tur_name} ${pet.cins_name}`}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent>
                    <Box>
                      <Chip
                        icon={<PetsIcon />}
                        label={`${pet.tur_name || 'Bilinmiyor'} - ${pet.cins_name || 'Bilinmiyor'}`}
                        color="primary"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 20 }} />
                        {pet.sehir}, {pet.ilce}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ mr: 1, fontSize: 20 }} />
                        {activeTab === 0 
                          ? new Date(pet.kaybolma_tarihi).toLocaleDateString('tr-TR')
                          : new Date(pet.created_at).toLocaleDateString('tr-TR')
                        }
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>

                {/* Düzenleme ve Silme Butonları */}
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <Button 
                    size="small" 
                    onClick={() => handleToggleActive(pet, activeTab === 0 ? 'lost' : 'found')}
                    sx={{ mr: 1 }}
                    startIcon={pet.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    color={pet.active ? "warning" : "success"}
                  >
                    {pet.active ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleEditClick(pet, activeTab === 0 ? 'lost' : 'found')}
                    sx={{ mr: 1 }}
                    startIcon={<EditIcon />}
                  >
                    Düzenle
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleDeleteClick(pet, activeTab === 0 ? 'lost' : 'found')}
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Sil
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Silme Onay Dialog'u */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>İlanı Sil</DialogTitle>
          <DialogContent>
            <Typography>Bu ilanı silmek istediğinizden emin misiniz?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Düzenleme Dialog'u */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>İlanı Düzenle</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tür</InputLabel>
                    <Select
                      value={editFormData.tur}
                      label="Tür"
                      onChange={(e) => {
                        setEditFormData({ 
                          ...editFormData, 
                          tur: e.target.value,
                          cins: '' // Tür değiştiğinde cinsi sıfırla
                        });
                      }}
                    >
                      {types.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.tur_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editFormData.tur}>
                    <InputLabel>Cins</InputLabel>
                    <Select
                      value={editFormData.cins}
                      label="Cins"
                      onChange={(e) => setEditFormData({ ...editFormData, cins: e.target.value })}
                    >
                      {breeds.map((breed) => (
                        <MenuItem key={breed.id} value={breed.id}>
                          {breed.cins_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Cinsiyet</InputLabel>
                    <Select
                      value={editFormData.cinsiyet}
                      label="Cinsiyet"
                      onChange={(e) => setEditFormData({ ...editFormData, cinsiyet: e.target.value })}
                    >
                      <MenuItem value="erkek">Erkek</MenuItem>
                      <MenuItem value="disi">Dişi</MenuItem>
                      <MenuItem value="bilinmiyor">Bilinmiyor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {editingPost?.type === 'lost' && (
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Kaybolma Tarihi"
                      value={editFormData.kaybolma_tarihi ? dayjs(editFormData.kaybolma_tarihi) : null}
                      onChange={(newValue) => setEditFormData({ ...editFormData, kaybolma_tarihi: newValue })}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true
                        }
                      }}
                      maxDate={dayjs()}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Şehir</InputLabel>
                    <Select
                      value={editFormData.sehir}
                      label="Şehir"
                      onChange={(e) => {
                        setEditFormData({ 
                          ...editFormData, 
                          sehir: e.target.value,
                          ilce: '' // Şehir değiştiğinde ilçeyi sıfırla
                        });
                      }}
                    >
                      {cities.map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editFormData.sehir}>
                    <InputLabel>İlçe</InputLabel>
                    <Select
                      value={editFormData.ilce}
                      label="İlçe"
                      onChange={(e) => setEditFormData({ ...editFormData, ilce: e.target.value })}
                    >
                      {districts.map((district) => (
                        <MenuItem key={district.id} value={district.id}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Açıklama"
                    multiline
                    rows={4}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>İptal</Button>
            <Button onClick={handleEditSubmit} color="primary">
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Boş durum mesajları */}
        {activeTab === 0 && lostPets.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Henüz kayıp ilanı vermemişsiniz.
          </Typography>
        )}
        {activeTab === 1 && foundPets.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Henüz buldum ilanı vermemişsiniz.
          </Typography>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default MyPosts; 
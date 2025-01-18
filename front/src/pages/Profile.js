import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Grid,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Swal from 'sweetalert2';

const Profile = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    adsoyad: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profile_image: ''
  });

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    if (!user) {
      navigate('/login');
      return;
    }

    // Kullanıcı bilgilerini form'a yükle
    setFormData(prev => ({
      ...prev,
      adsoyad: user.user.adsoyad || '',
      email: user.user.email || '',
      profile_image: user.user.profile_image || ''
    }));
    setLoading(false);
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          profile_image: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire({
        title: 'Hata!',
        text: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
        icon: 'error',
        confirmButtonColor: '#f50057'
      });
      navigate('/login');
      return;
    }

    // Şifre değişikliği yapılıyorsa kontrol et
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmNewPassword) {
        Swal.fire({
          title: 'Hata!',
          text: 'Yeni şifreler eşleşmiyor!',
          icon: 'error',
          confirmButtonColor: '#f50057'
        });
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.user.id,
          adsoyad: formData.adsoyad,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          profile_image: formData.profile_image
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Kullanıcı bilgilerini güncelle
        login({
          ...user,
          user: {
            ...user.user,
            adsoyad: formData.adsoyad,
            email: formData.email,
            profile_image: formData.profile_image
          }
        });

        Swal.fire({
          title: 'Başarılı!',
          text: 'Profil bilgileriniz güncellendi.',
          icon: 'success',
          confirmButtonColor: '#2196f3'
        });

        // Şifre alanlarını temizle
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      } else {
        Swal.fire({
          title: 'Hata!',
          text: data.message || 'Güncelleme sırasında bir hata oluştu.',
          icon: 'error',
          confirmButtonColor: '#f50057'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Hata!',
        text: 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        icon: 'error',
        confirmButtonColor: '#f50057'
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Avatar
            src={formData.profile_image}
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="icon-button-file">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Profil Bilgilerim
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ad Soyad"
                name="adsoyad"
                value={formData.adsoyad}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Şifre Değiştir
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mevcut Şifre"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yeni Şifre"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yeni Şifre Tekrar"
                name="confirmNewPassword"
                type="password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Değişiklikleri Kaydet
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 
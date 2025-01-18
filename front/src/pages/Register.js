import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: 'Hata!',
        text: 'Şifreler eşleşmiyor!',
        icon: 'error',
        confirmButtonColor: '#f50057',
        confirmButtonText: 'Tamam'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adsoyad: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        Swal.fire({
          title: 'Başarılı!',
          text: 'Kayıt işlemi başarıyla tamamlandı.',
          icon: 'success',
          confirmButtonColor: '#2196f3',
          confirmButtonText: 'Tamam'
        }).then(() => {
          navigate('/');
        });
      } else {
        Swal.fire({
          title: 'Hata!',
          text: data.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.',
          icon: 'error',
          confirmButtonColor: '#f50057',
          confirmButtonText: 'Tamam'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Hata!',
        text: 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
        icon: 'error',
        confirmButtonColor: '#f50057',
        confirmButtonText: 'Tamam'
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Kayıt Ol
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Ad Soyad"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="E-posta"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Şifre"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Şifre Tekrar"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Kayıt Ol
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            size="large"
            onClick={() => navigate('/login')}
          >
            Zaten hesabın var mı? Giriş yap
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 
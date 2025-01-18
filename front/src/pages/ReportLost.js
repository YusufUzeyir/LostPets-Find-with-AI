import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const COLORS = ['#15F5BA', '#687EFF', '#EBF400'];

const ReportLost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  
  // Yeni state'ler
  const [types, setTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  
  const [formData, setFormData] = useState({
    tur: '',
    cins: '',
    cinsiyet: '',
    sehir: '',
    ilce: '',
    kaybolma_tarihi: null,
    lost_image: null,
    description: ''
  });

  // Verileri yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Türleri getir
        const typesResponse = await fetch('http://localhost:5000/api/pets/types');
        const typesData = await typesResponse.json();
        setTypes(typesData);

        // Şehirleri getir
        const citiesResponse = await fetch('http://localhost:5000/api/pets/cities');
        const citiesData = await citiesResponse.json();
        setCities(citiesData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };

    fetchData();
  }, []);

  // Tür değiştiğinde cinsleri getir
  useEffect(() => {
    const fetchBreeds = async () => {
      if (formData.tur) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/breeds/${formData.tur}`);
          const data = await response.json();
          setBreeds(data);
        } catch (error) {
          console.error('Cins getirme hatası:', error);
        }
      } else {
        setBreeds([]);
      }
    };

    fetchBreeds();
  }, [formData.tur]);

  // Şehir değiştiğinde ilçeleri getir
  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.sehir) {
        try {
          const response = await fetch(`http://localhost:5000/api/pets/districts/${formData.sehir}`);
          const data = await response.json();
          setDistricts(data);
        } catch (error) {
          console.error('İlçe getirme hatası:', error);
        }
      } else {
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [formData.sehir]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Mevcut kullanıcı:', user);
    console.log('Kullanıcı email:', user?.user?.email);

    if (!formData.lost_image) {
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Lütfen bir resim yükleyin.',
      });
      return;
    }

    // Form validasyonu
    if (!formData.tur || !formData.cins || !formData.cinsiyet || !formData.sehir || !formData.ilce || !formData.kaybolma_tarihi) {
      console.log('Form validasyon hatası - Eksik alanlar:', {
        tur: !formData.tur,
        cins: !formData.cins,
        cinsiyet: !formData.cinsiyet,
        sehir: !formData.sehir,
        ilce: !formData.ilce,
        kaybolma_tarihi: !formData.kaybolma_tarihi
      });
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Lütfen tüm alanları doldurun.',
      });
      return;
    }

    // Kullanıcı kontrolü
    if (!user?.user?.email) {
      console.log('Kullanıcı giriş hatası:', {
        user: user,
        userObj: user?.user,
        email: user?.user?.email
      });
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Lütfen giriş yapın.',
      });
      return;
    }

    try {
      setLoading(true);

      // Gönderilecek verileri hazırla
      const postData = {
        tur: parseInt(formData.tur),
        cins: parseInt(formData.cins),
        cinsiyet: formData.cinsiyet,
        sehir: parseInt(formData.sehir),
        ilce: parseInt(formData.ilce),
        kaybolma_tarihi: formData.kaybolma_tarihi.format('YYYY-MM-DD'),
        email: user.user.email,
        lost_image: formData.lost_image,
        description: formData.description
      };

      console.log('Gönderilecek veriler:', postData);

      const response = await fetch('http://localhost:5000/api/pets/lost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      console.log('API yanıt durumu:', response.status);
      const responseData = await response.json();
      console.log('API yanıt verisi:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'İlan kaydedilemedi');
      }

      Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'İlanınız başarıyla yayınlandı.',
      });

      navigate('/');
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      console.error('Hata detayı:', {
        message: error.message,
        stack: error.stack
      });
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'İlan kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            setPreviewImage(base64Image);
            setFormData(prev => ({
                ...prev,
                lost_image: base64Image
            }));
            
            try {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch('http://localhost:5000/api/ai/classify', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('AI servisi yanıt vermedi');
                }

                const result = await response.json();
                
                // Tahmin oranı kontrolü
                const confidenceValue = parseFloat(result.confidence?.replace('%', '') || 0);
                if (confidenceValue < 80) {
                    setAiResult({
                        error: 'Yüklenen görselde kedi veya köpek tespit edilemedi veya tespit oranı düşük. Lütfen daha net bir fotoğraf yükleyin.',
                        lowConfidence: true
                    });
                    return;
                }
                
                setAiResult(result);
            } catch (error) {
                console.error('AI servisi hatası:', error);
                setAiResult({ error: error.message });
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Kayıp İlanı Ver
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ 
                width: '100%', 
                height: '300px', 
                border: '2px dashed #ccc',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="raised-button-file" style={{ width: '100%', height: '100%', display: 'block' }}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Seçilen resim"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'pointer'
                      }}
                    />
                  ) : (
                    <Box sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}>
                      <AddPhotoAlternateIcon sx={{ fontSize: 60, color: '#666' }} />
                      <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                        Resim Yüklemek İçin Tıklayın
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>
            </Grid>

            {aiResult && !aiResult.error && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#e3f2fd',
                    borderRadius: 2,
                    border: '1px solid #90caf9'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Yapay Zeka Analiz Sonucu
                  </Typography>
                  <Typography variant="body1">{aiResult.message}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Tür Tahmini Doğruluk:</strong> {aiResult.confidence}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Cins Tahmini Doğruluk:</strong> {aiResult.subclass_confidence}
                  </Typography>

                  {aiResult.all_predictions && (
                    <Box sx={{ mt: 2, height: 400, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" gutterBottom align="center">
                          En Yüksek İhtimalli İlk 3 Cins
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={aiResult.all_predictions.slice(0, 3).map(pred => ({
                                name: pred.breed,
                                value: parseFloat(pred.probability.replace('%', ''))
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={null}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {
                                aiResult.all_predictions.slice(0, 3).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))
                              }
                            </Pie>
                            <Tooltip 
                              formatter={(value) => `${value.toFixed(2)}%`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Box sx={{ width: 200, ml: 2 }}>
                        {aiResult.all_predictions.slice(0, 3).map((pred, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'rgba(0,0,0,0.04)'
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                bgcolor: COLORS[index],
                                mr: 1
                              }} 
                            />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {pred.breed}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {pred.probability}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {aiResult?.error && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: aiResult.lowConfidence ? '#fff3e0' : '#ffebee',
                    borderRadius: 2,
                    border: `1px solid ${aiResult.lowConfidence ? '#ffb74d' : '#ef9a9a'}`
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: aiResult.lowConfidence ? '#e65100' : '#c62828',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {aiResult.error}
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tür</InputLabel>
                <Select
                  value={formData.tur}
                  label="Tür"
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
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
              <FormControl fullWidth required disabled={!formData.tur}>
                <InputLabel>Cins</InputLabel>
                <Select
                  value={formData.cins}
                  label="Cins"
                  onChange={(e) => setFormData({ ...formData, cins: e.target.value })}
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
              <FormControl fullWidth required>
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                  value={formData.cinsiyet}
                  label="Cinsiyet"
                  onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                >
                  <MenuItem value="erkek">Erkek</MenuItem>
                  <MenuItem value="disi">Dişi</MenuItem>
                  <MenuItem value="bilinmiyor">Bilinmiyor</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Kaybolma Tarihi"
                value={formData.kaybolma_tarihi}
                onChange={(newValue) => setFormData({ ...formData, kaybolma_tarihi: newValue })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true
                  }
                }}
                maxDate={dayjs()}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Şehir</InputLabel>
                <Select
                  value={formData.sehir}
                  label="Şehir"
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
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
              <FormControl fullWidth required disabled={!formData.sehir}>
                <InputLabel>İlçe</InputLabel>
                <Select
                  value={formData.ilce}
                  label="İlçe"
                  onChange={(e) => setFormData({ ...formData, ilce: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Hayvanınızın özellikleri, kaybolduğu yer ve zaman hakkında detaylı bilgi verin..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'İlanı Yayınla'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportLost; 
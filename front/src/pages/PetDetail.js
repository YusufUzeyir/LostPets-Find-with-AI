import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardMedia
} from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Leaflet varsayılan ikon hatası için çözüm
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Özel marker ikonu oluştur
const pulsingIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div class="pulse"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// CSS stillerini ekle
const markerStyle = `
  .custom-marker .pulse {
    width: 20px;
    height: 20px;
    background: rgba(255, 0, 0, 0.8);
    border-radius: 50%;
    position: relative;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.5);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;

// Stil elementini oluştur ve head'e ekle
const styleSheet = document.createElement("style");
styleSheet.innerText = markerStyle;
document.head.appendChild(styleSheet);

// Harita bileşeni
const MapComponent = React.memo(({ coordinates }) => {
  if (!coordinates) return null;

  const position = [coordinates.lat, coordinates.lng];
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={position}
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        key={`${coordinates.lat}-${coordinates.lng}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={pulsingIcon}>
          <Popup>
            Kayıp/Bulunan Evcil Hayvan Konumu
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
});

const PetDetail = () => {
  const { id, type } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coordinates, setCoordinates] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPetDetail = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/pets/${type}/${id}`);
        const data = await response.json();
        setPet(data);

        // İl ve ilçe bilgisine göre koordinatları al
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/search?city=${data.sehir}&county=${data.ilce}&country=Turkey&format=json`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.length > 0) {
          const newCoordinates = {
            lat: parseFloat(geocodeData[0].lat),
            lng: parseFloat(geocodeData[0].lon)
          };
          console.log('Koordinatlar bulundu:', newCoordinates);
          setCoordinates(newCoordinates);
        } else {
          console.log('Koordinatlar bulunamadı:', data.sehir, data.ilce);
        }

        setLoading(false);
      } catch (error) {
        console.error('İlan detayı getirilemedi:', error);
        setLoading(false);
      }
    };

    fetchPetDetail();
  }, [id, type]);

  const handleContactClick = (receiverEmail) => {
    if (!user) {
      Swal.fire({
        title: 'Uyarı!',
        text: 'Mesaj göndermek için giriş yapmalısınız.',
        icon: 'warning',
        confirmButtonColor: '#2196f3',
        confirmButtonText: 'Giriş Yap'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    navigate('/messages', { state: { receiver: receiverEmail } });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!pet) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          İlan bulunamadı.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Geri Dön
      </Button>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={type === 'lost' ? pet.lost_image : pet.found_image}
              alt={`${pet.tur_name} ${pet.cins_name}`}
              sx={{ objectFit: 'contain' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Chip
                    icon={<PetsIcon />}
                    label={`${pet.tur_name || 'Bilinmiyor'} - ${pet.cins_name || 'Bilinmiyor'}`}
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1 }} />
                    {pet.sehir}, {pet.ilce}
                  </Typography>

                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarTodayIcon sx={{ mr: 1 }} />
                    {type === 'lost' 
                      ? `Kaybolma Tarihi: ${new Date(pet.kaybolma_tarihi).toLocaleDateString('tr-TR')}`
                      : `İlan Tarihi: ${new Date(pet.created_at).toLocaleDateString('tr-TR')}`
                    }
                  </Typography>

                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    {pet.adsoyad}
                  </Typography>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Açıklama
                </Typography>
                <Typography variant="body1" paragraph>
                  {pet.description || 'Açıklama bulunmuyor.'}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Konum
                </Typography>
                {coordinates ? (
                  <Box sx={{ height: 300, width: '100%', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    <MapComponent coordinates={coordinates} />
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Konum bilgisi yüklenemedi.
                  </Typography>
                )}

                {user && user.user.email !== pet.email && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    onClick={() => handleContactClick(pet.email)}
                    sx={{ mt: 2 }}
                  >
                    İletişime Geç
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PetDetail; 
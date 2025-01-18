import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ mt: 8, mb: 6, textAlign: 'center' }}>
        <PetsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Kayıp Dostlar
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Kayıp hayvanları sahipleriyle, bulunan hayvanları yuvasıyla buluşturuyoruz.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Kayıp Hayvan mı Arıyorsunuz?
            </Typography>
            <Typography color="text.secondary" paragraph>
              Kayıp hayvan ilanlarını inceleyin veya yeni bir kayıp ilanı verin.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/lost-pets')}
                sx={{ mr: 2 }}
              >
                İlanları İncele
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/report-lost')}
                startIcon={<AddIcon />}
              >
                İlan Ver
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <PetsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Hayvan mı Buldunuz?
            </Typography>
            <Typography color="text.secondary" paragraph>
              Bulduğunuz hayvanı ilan edin veya bulunan hayvan ilanlarını inceleyin.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/found-pets')}
                sx={{ mr: 2 }}
              >
                İlanları İncele
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/report-found')}
                startIcon={<AddIcon />}
              >
                İlan Ver
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 
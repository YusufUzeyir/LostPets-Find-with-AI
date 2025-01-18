# Lost Pets - Find with AI

Kayıp evcil hayvanları yapay zeka destekli görüntü işleme ile bulma platformu. Bu proje, kayıp ve bulunan evcil hayvanları eşleştirmek için modern web teknolojileri ve yapay zeka kullanmaktadır.

## Özellikler

- 🐾 Kayıp ve bulunan hayvan ilanları oluşturma
- 🤖 Yapay zeka ile hayvan türü ve cins tespiti
- 📍 OpenStreetMap ile konum bilgisi
- 💬 Kullanıcılar arası mesajlaşma sistemi
- 🔍 İlan arama ve filtreleme
- 👤 Kullanıcı profil yönetimi
- 🌙 Karanlık/Aydınlık tema desteği
- 📱 Mobil uyumlu tasarım

## Teknolojiler

### Frontend
- React.js
- Material-UI
- React Router
- Context API
- Axios
- Leaflet (Harita)
- SweetAlert2
- dayjs

### Backend
- Node.js
- Express.js
- PostgreSQL
- bcrypt (Şifreleme)
- JWT (Kimlik doğrulama)
- Python (AI servisi)
- PyTorch

## Kurulum

1. Repoyu klonlayın:
\`\`\`bash
git clone https://github.com/YusufUzeyir/LostPets-Find-with-AI.git
cd LostPets-Find-with-AI
\`\`\`

2. Frontend bağımlılıklarını yükleyin:
\`\`\`bash
cd front
npm install
\`\`\`

3. Backend bağımlılıklarını yükleyin:
\`\`\`bash
cd ../backend
npm install
\`\`\`

4. PostgreSQL veritabanını kurun ve `schema_dump.sql` dosyasını içe aktarın.

5. Backend için `.env` dosyası oluşturun:
\`\`\`env
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
\`\`\`

6. AI modelini indirin ve `backend/src/ai_services/models` klasörüne yerleştirin.

7. Uygulamayı başlatın:

Frontend:
\`\`\`bash
cd front
npm start
\`\`\`

Backend:
\`\`\`bash
cd backend
npm run dev
\`\`\`

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Yeni bir branch oluşturun (\`git checkout -b feature/amazing-feature\`)
3. Değişikliklerinizi commit edin (\`git commit -m 'Add some amazing feature'\`)
4. Branch'inizi push edin (\`git push origin feature/amazing-feature\`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## İletişim

Yusuf Üzeyir YILMAZ - [@YusufUzeyir](https://github.com/YusufUzeyir) 
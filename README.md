# Sigorta Vip API

Bu proje, sigorta şirketleri ve acenteler için bir API ve yönetim arayüzü içerir.

## Kurulum

### Backend (Django)

1. Sanal ortamı aktifleştirin:

   ```
   source venv/bin/activate
   ```

2. Gerekli paketleri yükleyin:

   ```
   pip install -r requirements.txt
   ```

3. Veritabanı migrasyonlarını uygulayın:

   ```
   python manage.py migrate
   ```

4. Django sunucusunu başlatın:
   ```
   python manage.py runserver
   ```

### Frontend (React)

1. Frontend dizinine gidin:

   ```
   cd frontend
   ```

2. Bağımlılıkları yükleyin:

   ```
   npm install
   ```

3. React uygulamasını başlatın:
   ```
   npm start
   ```

## Kullanım

- Backend API: http://localhost:8000/api/
- Frontend: http://localhost:3000

## Özellikler

- Şirket ve kullanıcı yönetimi
- Rol tabanlı yetkilendirme
- Sigorta şirketleri yönetimi
- Partaj yönetimi
- Sorgu türleri yönetimi

# SigortavipAPI Docker Kurulumu

Bu proje Docker kullanılarak kolayca çalıştırılabilir. Django backend, React frontend ve Nginx reverse proxy Docker container'larında çalışır.

## Gereksinimler

- Docker
- Docker Compose

## Kurulum ve Çalıştırma

### 1. Development ortamında tüm servisleri başlatma

```bash
docker-compose up --build
```

Bu komut şunları yapar:

- PostgreSQL veritabanını başlatır (port 5433)
- Django backend'i build edip çalıştırır
- React frontend'i build edip çalıştırır
- Nginx reverse proxy'yi başlatır

### 2. Production ortamında çalıştırma

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

Production ortamında:

- Frontend production build'i oluşturulur
- Gunicorn ile Django backend çalıştırılır
- Nginx tüm istekleri yönetir

### 3. Arka planda çalıştırma

```bash
docker-compose up -d --build
```

### 4. Sadece belirli servisleri çalıştırma

```bash
# Sadece backend ve veritabanı
docker-compose up backend db

# Sadece frontend
docker-compose up frontend
```

## Erişim

### Development Ortamı

- **Ana Uygulama (Nginx)**: http://localhost
- **Frontend Direkt**: http://localhost:3000 (sadece development)
- **Backend API**: http://localhost/api
- **Django Admin**: http://localhost/admin
- **API Dokümantasyonu**: http://localhost/swagger

### Production Ortamı

- **Ana Uygulama**: http://localhost (veya domain adınız)
- **Backend API**: http://localhost/api
- **Django Admin**: http://localhost/admin
- **API Dokümantasyonu**: http://localhost/swagger

## Veritabanı İşlemleri

### İlk kurulumda migration çalıştırma

```bash
# Development
docker-compose exec backend python manage.py migrate

# Production
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Superuser oluşturma

```bash
# Development
docker-compose exec backend python manage.py createsuperuser

# Production
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Static dosyaları toplama

```bash
# Development
docker-compose exec backend python manage.py collectstatic --noinput

# Production (otomatik yapılır)
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Development

### Log'ları görüntüleme

```bash
# Tüm servislerin log'ları
docker-compose logs -f

# Sadece nginx log'ları
docker-compose logs -f nginx

# Sadece backend log'ları
docker-compose logs -f backend

# Sadece frontend log'ları
docker-compose logs -f frontend
```

### Container'a bağlanma

```bash
# Backend container'ına bağlan
docker-compose exec backend bash

# Frontend container'ına bağlan
docker-compose exec frontend sh

# Nginx container'ına bağlan
docker-compose exec nginx sh
```

### Servisleri durdurma

```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Servisleri durdurma ve volume'ları silme

```bash
# Development
docker-compose down -v

# Production
docker-compose -f docker-compose.prod.yml down -v
```

## Ortam Değişkenleri

Gerekirse `.env` dosyası oluşturarak ortam değişkenlerini özelleştirebilirsiniz:

```bash
# .env
DEBUG=False
SECRET_KEY=your-very-secure-secret-key-here
POSTGRES_DB=sigorta_db
POSTGRES_USER=sigorta_user
POSTGRES_PASSWORD=very-secure-password
```

## Production Deployment

Production ortamında kullanmak için:

1. `.env` dosyası oluşturun ve güvenli değerler ayarlayın
2. `docker-compose.prod.yml` kullanın
3. SSL sertifikası ekleyin (`nginx/ssl/` klasörüne)
4. Domain adınızı nginx konfigürasyonunda güncelleyin

### SSL Sertifikası Ekleme

```bash
# SSL klasörü oluşturun
mkdir -p nginx/ssl

# Sertifikalarınızı kopyalayın
cp your-cert.crt nginx/ssl/
cp your-private.key nginx/ssl/
```

## Nginx Konfigürasyonu

- **Development**: `nginx/nginx.conf` - Reverse proxy olarak çalışır
- **Production**: Aynı dosya kullanılır, ancak SSL eklenebilir

### Özel Nginx Ayarları

Nginx konfigürasyonunu özelleştirmek için `nginx/nginx.conf` dosyasını düzenleyin.

## Sorun Giderme

### Port çakışması

Eğer 80, 3000 veya 5433 portları kullanılıyorsa, docker-compose.yml'de port numaralarını değiştirin.

### Nginx bağlantı sorunu

```bash
docker-compose logs nginx
```

komutunu çalıştırarak nginx log'larını kontrol edin.

### Veritabanı bağlantı sorunu

```bash
docker-compose logs db
```

komutunu çalıştırarak PostgreSQL log'larını kontrol edin.

### Frontend build sorunu

```bash
# Development
docker-compose exec frontend npm install
docker-compose restart frontend

# Production - yeniden build edin
docker-compose -f docker-compose.prod.yml up --build frontend
```

### Backend migration sorunu

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Static dosya sorunu

```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

## Performans İpuçları

1. **Production ortamında** her zaman `docker-compose.prod.yml` kullanın
2. **Gzip compression** nginx'te etkinleştirilmiştir
3. **Static dosyalar** için cache headers ayarlanmıştır
4. **Gunicorn** production'da 3 worker ile çalışır

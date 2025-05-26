# React frontend için Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (development için tüm dependencies gerekli)
RUN npm ci

# Proje dosyalarını kopyala
COPY . .

# Port
EXPOSE 3000

# React geliştirme sunucusunu başlat
CMD ["npm", "start"] 
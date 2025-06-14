from django.db import models

# Create your models here.

class Company(models.Model):
    name = models.CharField(verbose_name="Şirket Adı", max_length=255)
    code  = models.CharField(verbose_name="Şirket Kodu", max_length=255, unique=True)
    user_limit = models.IntegerField(verbose_name="Kullanıcı Limiti", default=0)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    expires_at = models.DateTimeField(verbose_name="Son Kullanma Tarihi", null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Şirket"
        verbose_name_plural = "Şirketler"
        ordering = ["-created_at"]


class Role(models.Model):
    name = models.CharField(verbose_name="Rol Adı", max_length=255)
    description = models.TextField(verbose_name="Açıklama", blank=True, null=True)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Rol"
        verbose_name_plural = "Roller"
        ordering = ["name"]


class QueryType(models.Model):
    INSURANCE_TYPE_CHOICES = (
        ('traffic', 'Trafik Sigortası'),
        ('casco', 'Kasko'),
        ('health', 'Sağlık Sigortası'),
        ('life', 'Hayat Sigortası'),
        ('travel', 'Seyahat Sigortası'),
        ('home', 'Konut Sigortası'),
        ('workplace', 'İşyeri Sigortası'),
        ('other', 'Diğer'),
    )
    
    name = models.CharField(verbose_name="Sorgu Türü", max_length=50, choices=INSURANCE_TYPE_CHOICES, unique=True)
    description = models.TextField(verbose_name="Açıklama", blank=True, null=True)
    
    def __str__(self):
        return self.get_name_display()
    
    class Meta:
        verbose_name = "Sorgu Türü"
        verbose_name_plural = "Sorgu Türleri"
        ordering = ["name"]


class RolePermission(models.Model):
    role = models.ForeignKey(Role, verbose_name="Rol", on_delete=models.CASCADE, related_name="permissions")
    query_type = models.ForeignKey(QueryType, verbose_name="Sorgu Türü", on_delete=models.CASCADE)
    can_query = models.BooleanField(verbose_name="Sorgulama Yetkisi", default=True)
    can_create = models.BooleanField(verbose_name="Oluşturma Yetkisi", default=False)
    can_update = models.BooleanField(verbose_name="Güncelleme Yetkisi", default=False)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    
    def __str__(self):
        return f"{self.role.name} - {self.query_type}"
    
    class Meta:
        verbose_name = "Rol İzni"
        verbose_name_plural = "Rol İzinleri"
        unique_together = ['role', 'query_type']


class CompanyUser(models.Model):
    company = models.ForeignKey(Company, verbose_name="Şirket", on_delete=models.CASCADE)
    user = models.OneToOneField("auth.User", verbose_name="Kullanıcı", on_delete=models.CASCADE)
    roles = models.ManyToManyField(Role, verbose_name="Roller", blank=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    expires_at = models.DateTimeField(verbose_name="Son Kullanma Tarihi", null=True, blank=True)
    is_admin = models.BooleanField(verbose_name="Admin mi?", default=False)

    def __str__(self):
        return f"{self.user.username} - {self.company.code}"
    
    def has_permission(self, query_type_name):
        """Kullanıcının belirli bir sorgu türü için yetkisi olup olmadığını kontrol eder."""
        if self.is_admin:
            return True
            
        user_roles = self.roles.filter(is_active=True)
        return RolePermission.objects.filter(
            role__in=user_roles,
            query_type__name=query_type_name,
            can_query=True
        ).exists()
    
    class Meta:
        verbose_name = "Şirket Kullanıcısı"
        verbose_name_plural = "Şirket Kullanıcıları"
        ordering = ["-created_at"]


class InsuranceCompany(models.Model):
    name = models.CharField(verbose_name="Sigorta Şirketi Adı", max_length=255)
    image = models.ImageField(verbose_name="Sigorta Şirketi Logosu", upload_to="insurance_company_logos/",blank=True, null=True)
    login_url = models.CharField(verbose_name="Giriş URL", max_length=255,null=True, blank=True)
    explorer_url = models.CharField(verbose_name="Explorer URL", max_length=255,null=True, blank=True)
    home_url = models.CharField(verbose_name="Anasayfa URL", max_length=255,null=True, blank=True)
    code = models.CharField(verbose_name="Sigorta Şirketi Kodu", max_length=255, unique=True)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    
    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Sigorta Şirketi"
        verbose_name_plural = "Sigorta Şirketleri"
        ordering = ["-created_at"]


class Partage(models.Model):
    name = models.CharField(verbose_name="Partaj Adı", max_length=255)
    code = models.CharField(verbose_name="Partaj Kodu", max_length=255, unique=True)
    order = models.IntegerField(verbose_name="Sıra", default=0)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Partaj"
        verbose_name_plural = "Partajlar"
        ordering = ["-created_at"]

class InsuranceCompanyItem(models.Model):
    insurance_company = models.ForeignKey(InsuranceCompany, verbose_name="Sigorta Şirketi", on_delete=models.CASCADE)
    company = models.ForeignKey(Company, verbose_name="Şirket", on_delete=models.CASCADE)
    username = models.CharField(verbose_name="Kullanıcı Adı", max_length=255,null=True, blank=True)
    password = models.CharField(verbose_name="Şifre", max_length=255,null=True, blank=True)
    query_types = models.ManyToManyField(QueryType, verbose_name="Sorgu Türleri", blank=True)
    sms_code = models.CharField(verbose_name="SMS Kodu", max_length=255,null=True, blank=True)
    totp_code = models.CharField(verbose_name="Totp Kodu", max_length=255,null=True, blank=True)
    phone_number = models.CharField(verbose_name="Telefon Numarası", max_length=255,null=True, blank=True)
    proxy_url = models.CharField(verbose_name="Proxy URL", max_length=255,null=True, blank=True)
    proxy_username = models.CharField(verbose_name="Proxy Kullanıcı Adı", max_length=255,null=True, blank=True)
    proxy_password = models.CharField(verbose_name="Proxy Şifre", max_length=255,null=True, blank=True)
    is_proxy_active = models.BooleanField(verbose_name="Proxy Aktif mi?", default=True)
    is_active = models.BooleanField(verbose_name="Aktif mi?", default=True)
    is_car_query = models.BooleanField(verbose_name="Araç Sorgulama", default=False)
    cookie_use = models.BooleanField(verbose_name="Cookie Kullanımı", default=False)
    cookie = models.TextField(verbose_name="Cookie", null=True, blank=True)
    partage = models.ForeignKey(Partage, verbose_name="Partaj", on_delete=models.CASCADE,null=True, blank=True)
    created_at = models.DateTimeField(verbose_name="Oluşturulma Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    
    def __str__(self):
        return f"{self.insurance_company.name} - {self.company.name}"
    
    class Meta:
        verbose_name = "Sigorta Şirketi Öğesi"
        verbose_name_plural = "Sigorta Şirketi Öğeleri"
        ordering = ["-created_at"]

class InsuranceCompanyCookie(models.Model):
    insurance_company_item = models.ForeignKey(InsuranceCompanyItem, verbose_name="Sigorta Şirketi Öğesi", on_delete=models.CASCADE, related_name='cookies')
    name = models.CharField(verbose_name="Cookie Adı", max_length=255)
    value = models.TextField(verbose_name="Cookie Değeri")
    domain = models.CharField(verbose_name="Domain", max_length=255)
    path = models.CharField(verbose_name="Path", max_length=255, default="/")
    expires = models.DateTimeField(verbose_name="Son Kullanma Tarihi", null=True, blank=True)
    creation = models.DateTimeField(verbose_name="Oluşturulma Tarihi", null=True, blank=True)
    last_access = models.DateTimeField(verbose_name="Son Erişim Tarihi", null=True, blank=True)
    http_only = models.BooleanField(verbose_name="HTTP Only", default=False)
    secure = models.BooleanField(verbose_name="Secure", default=False)
    same_site = models.IntegerField(verbose_name="SameSite", default=0, choices=[
        (0, 'None'),
        (1, 'Lax'), 
        (2, 'Strict')
    ])
    priority = models.IntegerField(verbose_name="Priority", default=0, choices=[
        (0, 'Low'),
        (1, 'Medium'),
        (2, 'High')
    ])
    created_at = models.DateTimeField(verbose_name="Kayıt Tarihi", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="Güncellenme Tarihi", auto_now=True)
    
    def __str__(self):
        return f"{self.insurance_company_item} - {self.name}"
    
    class Meta:
        verbose_name = "Sigorta Şirketi Cookie"
        verbose_name_plural = "Sigorta Şirketi Cookies"
        ordering = ["-created_at"]
        unique_together = ['insurance_company_item', 'name', 'domain']



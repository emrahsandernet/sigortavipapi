from rest_framework import serializers
from .models import Company, CompanyUser, InsuranceCompany, InsuranceCompanyItem, Role, QueryType, RolePermission, Partage
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import ValidationError
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class QueryTypeSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = QueryType
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    query_type_name = serializers.CharField(source='query_type.get_name_display', read_only=True)
    
    class Meta:
        model = RolePermission
        fields = '__all__'
        
class RoleDetailSerializer(serializers.ModelSerializer):
    permissions = RolePermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'

class CompanyUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    roles = RoleSerializer(many=True, read_only=True)
    
    class Meta:
        model = CompanyUser
        fields = '__all__'
        
class CompanyUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyUser
        fields = '__all__'

class CompanyLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)
    company_code = serializers.CharField(max_length=255)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        company_code = data.get('company_code')
        
        if not username or not password or not company_code:
            raise ValidationError("Kullanıcı adı, şifre ve şirket kodu gerekli.")
        
        # Şirket kodunu kontrol et
        try:
            company = Company.objects.get(code=company_code)
            if not company.is_active:
                raise ValidationError("Şirket aktif değil.")
            
            # Şirket süresi dolmuş mu kontrol et
            if company.expires_at and company.expires_at < timezone.now():
                raise ValidationError("Şirket abonelik süresi dolmuş.")
        except Company.DoesNotExist:
            raise ValidationError("Geçersiz şirket kodu.")
        
        # Kullanıcıyı doğrula
        user = authenticate(username=username, password=password)
        if not user:
            raise ValidationError("Geçersiz kullanıcı adı veya şifre.")
        
        # Kullanıcının bu şirkete bağlı olup olmadığını kontrol et
        try:
            company_user = CompanyUser.objects.get(user=user, company=company)
            
            # Kullanıcı aktif mi kontrol et
            if not company_user.is_active:
                raise ValidationError("Kullanıcı hesabı aktif değil.")
            
            # Kullanıcı süresi dolmuş mu kontrol et
            if company_user.expires_at and company_user.expires_at < timezone.now():
                raise ValidationError("Kullanıcı hesabı süresi dolmuş.")
                
        except CompanyUser.DoesNotExist:
            raise ValidationError("Bu kullanıcı bu şirkete bağlı değil.")
        
        # Doğrulama başarılı, kullanıcı ve şirket bilgilerini döndür
        data['user'] = user
        data['company'] = company
        data['company_user'] = company_user
        return data

class InsuranceCompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCompany
        fields = '__all__'


class PartageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partage
        fields = '__all__'


class PartageDetailSerializer(serializers.ModelSerializer):
    related_companies = serializers.SerializerMethodField()
    
    class Meta:
        model = Partage
        fields = '__all__'
    
    def get_related_companies(self, obj):
        items = InsuranceCompanyItem.objects.filter(partage=obj)
        
        # Bu öğelerin şirketlerini al
        companies = []
        for item in items:
            company_data = {
                'id': item.company.id,
                'name': item.company.name,
                'code': item.company.code,
                'insurance_company': {
                    'id': item.insurance_company.id,
                    'name': item.insurance_company.name,
                    'code': item.insurance_company.code
                },
                'insurance_company_item_id': item.id
            }
            companies.append(company_data)
        
        return companies
        

class InsuranceCompanyItemSerializer(serializers.ModelSerializer):
    query_types = QueryTypeSerializer(many=True, read_only=True)
    related_companies = serializers.SerializerMethodField()
    same_insurance_company_items = serializers.SerializerMethodField()
    insurance_company = InsuranceCompanySerializer(read_only=True)
    
    
    class Meta:
        model = InsuranceCompanyItem
        fields = '__all__'
    
    def get_related_companies(self, obj):
        # Bu öğenin partajını al
        print(obj.company)
        
        
        # Aynı partaja sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(company=obj.company).exclude(id=obj.id).distinct()
        print(related_items)
        
        # Şirket bilgilerini hazırla
        companies_data = []
        for related_item in related_items:
            company_data = {
                'id': related_item.company.id,
                'name': related_item.company.name,
                'code': related_item.company.code,
                'insurance_company': {
                    'id': related_item.insurance_company.id,
                    'name': related_item.insurance_company.name,
                    'code': related_item.insurance_company.code
                },
                'insurance_company_item_id': related_item.id,
                'partage': {
                    'id': related_item.partage.id if related_item.partage else None, 
                    'name': related_item.partage.name if related_item.partage else None, 
                    'code': related_item.partage.code if related_item.partage else None
                }
            }
            companies_data.append(company_data)
        
        return companies_data
    
    def get_same_insurance_company_items(self, obj):
        # Bu öğenin partajını ve sigorta şirketini al
        partage = obj.partage
        insurance_company = obj.insurance_company
        
        if not partage or not insurance_company:
            return []
        
        # Aynı partaja ve aynı sigorta şirketine sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(
            partage=partage,
            insurance_company=insurance_company
        ).exclude(id=obj.id).distinct()
        
        # Öğe bilgilerini hazırla
        items_data = []
        for related_item in related_items:
            item_data = {
                'id': related_item.id,
                'company': {
                    'id': related_item.company.id,
                    'name': related_item.company.name,
                    'code': related_item.company.code
                },
                'insurance_company': {
                    'id': related_item.insurance_company.id,
                    'name': related_item.insurance_company.name,
                    'code': related_item.insurance_company.code
                },
                'partage': {
                    'id': related_item.partage.id, 
                    'name': related_item.partage.name, 
                    'code': related_item.partage.code
                },
                'is_active': related_item.is_active,
                'is_proxy_active': related_item.is_proxy_active,
                'is_car_query': related_item.is_car_query
            }
            items_data.append(item_data)
        
        return items_data
    
    
        
class InsuranceCompanyItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCompanyItem
        fields = '__all__'

class InsuranceCompanyItemDetailSerializer(serializers.ModelSerializer):
    insurance_company = InsuranceCompanySerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    query_types = QueryTypeSerializer(many=True, read_only=True)
    partage = PartageSerializer(read_only=True)
    related_companies = serializers.SerializerMethodField()

    
    class Meta:
        model = InsuranceCompanyItem
        fields = '__all__'
        
    def get_related_companies(self, obj):
        # Bu öğenin partajını al
        partage = obj.partage
        
        if not partage:
            return []
        
        # Aynı partaja sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(company=obj.company).exclude(id=obj.id).distinct()
        
        # Şirket bilgilerini hazırla
        companies_data = []
        for related_item in related_items:
            company_data = {
                'id': related_item.company.id,
                'username': related_item.username,
                'password': related_item.password,
                'sms_code': related_item.sms_code,
                'totp_code': related_item.totp_code,
                'phone_number': related_item.phone_number,
                'proxy_url': related_item.proxy_url,
                'proxy_username': related_item.proxy_username,
                'proxy_password': related_item.proxy_password,
                'is_proxy_active': related_item.is_proxy_active,
                'is_active': related_item.is_active,
                'is_car_query': related_item.is_car_query,
                'cookie_use': related_item.cookie_use,
                'cookie': related_item.cookie,
                'insurance_company_item_id': related_item.id,
                'partage': {
                    'id': related_item.partage.id, 
                    'name': related_item.partage.name, 
                    'code': related_item.partage.code
                }
            }
            companies_data.append(company_data)
        
        return companies_data

        # Bu öğenin partajını ve sigorta şirketini al
        partage = obj.partage
        insurance_company = obj.insurance_company
        
        if not partage or not insurance_company:
            return []
        
        # Aynı partaja ve aynı sigorta şirketine sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(
            partage=partage,
            insurance_company=insurance_company
        ).exclude(id=obj.id).distinct()
        
        # Öğe bilgilerini hazırla
        items_data = []
        for related_item in related_items:
            item_data = {
                'id': related_item.id,
                'company': {
                    'id': related_item.company.id,
                    'name': related_item.company.name,
                    'code': related_item.company.code
                },
                'insurance_company': {
                    'id': related_item.insurance_company.id,
                    'name': related_item.insurance_company.name,
                    'code': related_item.insurance_company.code
                },
                'partage': {
                    'id': related_item.partage.id, 
                    'name': related_item.partage.name, 
                    'code': related_item.partage.code
                },
                'is_active': related_item.is_active,
                'is_proxy_active': related_item.is_proxy_active,
                'is_car_query': related_item.is_car_query
            }
            items_data.append(item_data)
        
        return items_data 
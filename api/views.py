from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.authtoken.models import Token
from .models import Company, CompanyUser, InsuranceCompany, InsuranceCompanyItem, Role, QueryType, RolePermission, Partage
from .serializers import (
    CompanySerializer, CompanyUserSerializer, CompanyUserCreateSerializer,
    InsuranceCompanySerializer, InsuranceCompanyItemSerializer, InsuranceCompanyItemDetailSerializer, 
    InsuranceCompanyItemCreateUpdateSerializer, UserSerializer, RoleSerializer, RoleDetailSerializer, 
    QueryTypeSerializer, RolePermissionSerializer, PartageSerializer, PartageDetailSerializer,
    CompanyLoginSerializer
)
from django.contrib.auth.models import User
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import pyotp

# Create your views here.

@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['username', 'password', 'company_code'],
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='Kullanıcı adı', default='emrahsander'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Şifre', default='ardahan91185'),
            'company_code': openapi.Schema(type=openapi.TYPE_STRING, description='Şirket kodu', default='tst'),
        },
    ),
    responses={
        200: openapi.Response(
            description='Başarılı giriş',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'token': openapi.Schema(type=openapi.TYPE_STRING),
                    'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                    'username': openapi.Schema(type=openapi.TYPE_STRING),
                    'email': openapi.Schema(type=openapi.TYPE_STRING),
                    'company': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'name': openapi.Schema(type=openapi.TYPE_STRING),
                            'code': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    ),
                    'is_admin': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                    'roles': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'name': openapi.Schema(type=openapi.TYPE_STRING),
                            }
                        )
                    )
                }
            )
        ),
        400: openapi.Response(description='Geçersiz giriş bilgileri'),
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def company_login(request):
    """
    Şirket bazlı kullanıcı girişi.
    Kullanıcı adı, şifre ve şirket kodu ile giriş yapar.
    Kullanıcı ve şirket durumlarını kontrol eder.
    """
    serializer = CompanyLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        company = serializer.validated_data['company']
        company_user = serializer.validated_data['company_user']
        
        # Token oluştur veya mevcut olanı getir
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'email': user.email,
            'company': {
                'id': company.id,
                'name': company.name,
                'code': company.code
            },
            'is_admin': company_user.is_admin,
            'roles': [{'id': role.id, 'name': role.name} for role in company_user.roles.all()]
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoleDetailSerializer
        return RoleSerializer
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm rolleri pagination olmadan döndürür
        """
        roles = Role.objects.all()
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        role = self.get_object()
        permissions = role.permissions.all()
        serializer = RolePermissionSerializer(permissions, many=True)
        return Response(serializer.data)

class QueryTypeViewSet(viewsets.ModelViewSet):
    queryset = QueryType.objects.all()
    serializer_class = QueryTypeSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm sorgu türlerini pagination olmadan döndürür
        """
        query_types = QueryType.objects.all()
        serializer = self.get_serializer(query_types, many=True)
        return Response(serializer.data)

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm rol izinlerini pagination olmadan döndürür
        """
        permissions = RolePermission.objects.all()
        serializer = self.get_serializer(permissions, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'role_id', 
                openapi.IN_QUERY, 
                description="Rol ID'si", 
                type=openapi.TYPE_INTEGER,
                default=1
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        role_id = request.query_params.get('role_id')
        if role_id:
            permissions = RolePermission.objects.filter(role_id=role_id)
            serializer = self.get_serializer(permissions, many=True)
            return Response(serializer.data)
        return Response({"error": "role_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'query_type_id', 
                openapi.IN_QUERY, 
                description="Sorgu Türü ID'si", 
                type=openapi.TYPE_INTEGER,
                default=1
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_query_type(self, request):
        query_type_id = request.query_params.get('query_type_id')
        if query_type_id:
            permissions = RolePermission.objects.filter(query_type_id=query_type_id)
            serializer = self.get_serializer(permissions, many=True)
            return Response(serializer.data)
        return Response({"error": "query_type_id query parameter is required"}, status=status.HTTP_400_BAD_REQUEST)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm şirketleri pagination olmadan döndürür
        """
        companies = Company.objects.all()
        serializer = self.get_serializer(companies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        company = self.get_object()
        company_users = CompanyUser.objects.filter(company=company)
        serializer = CompanyUserSerializer(company_users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def insurance_items(self, request, pk=None):
        company = self.get_object()
        items = InsuranceCompanyItem.objects.filter(company=company)
        serializer = InsuranceCompanyItemSerializer(items, many=True)
        return Response(serializer.data)

class CompanyUserViewSet(viewsets.ModelViewSet):
    queryset = CompanyUser.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CompanyUserCreateSerializer
        return CompanyUserSerializer
    
    def get_queryset(self):
        """
        Kullanıcının sadece kendi şirketindeki kullanıcıları görmesini sağlar.
        """
        user = self.request.user
        if user.is_authenticated:
            try:
                company_user = user.companyuser
                # Kullanıcının şirketine göre filtrele
                return CompanyUser.objects.filter(company=company_user.company)
            except CompanyUser.DoesNotExist:
                return CompanyUser.objects.none()
        return CompanyUser.objects.none()
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Kullanıcının şirketindeki tüm kullanıcıları pagination olmadan döndürür
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        # Sadece admin kullanıcılar yeni kullanıcı ekleyebilir
        if not request.user.companyuser.is_admin:
            return Response(
                {"error": "Sadece admin kullanıcılar yeni kullanıcı ekleyebilir."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Admin kullanıcı sadece kendi şirketine kullanıcı ekleyebilir
        admin_company = request.user.companyuser.company
        request_company_id = request.data.get('company')
        
        if str(admin_company.id) != str(request_company_id):
            return Response(
                {"error": "Sadece kendi şirketinize kullanıcı ekleyebilirsiniz."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # User nesnesi oluştur
        user_data = request.data.get('user')
        if not user_data:
            return Response({"error": "Kullanıcı bilgileri gereklidir."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.create_user(
                username=user_data.get('username'),
                email=user_data.get('email'),
                password=user_data.get('password'),
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
        except Exception as e:
            return Response({"error": f"Kullanıcı oluşturulurken hata oluştu: {str(e)}"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # CompanyUser nesnesi oluştur
        try:
            company_user = CompanyUser.objects.create(
                user=user,
                company=admin_company,
                is_admin=request.data.get('is_admin', False),
                is_active=request.data.get('is_active', True)
            )
            
            # Roller ekle
            roles = request.data.get('roles', [])
            if roles:
                for role_id in roles:
                    try:
                        role = Role.objects.get(id=role_id)
                        company_user.roles.add(role)
                    except Role.DoesNotExist:
                        pass
            
            serializer = self.get_serializer(company_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Hata durumunda oluşturulan kullanıcıyı sil
            user.delete()
            return Response({"error": f"Şirket kullanıcısı oluşturulurken hata oluştu: {str(e)}"}, 
                           status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        # Sadece admin kullanıcılar güncelleme yapabilir
        if not request.user.companyuser.is_admin:
            return Response(
                {"error": "Sadece admin kullanıcılar kullanıcı bilgilerini güncelleyebilir."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Güncellenecek kullanıcıyı al
        company_user = self.get_object()
        
        # Admin kullanıcı sadece kendi şirketindeki kullanıcıları güncelleyebilir
        admin_company = request.user.companyuser.company
        if company_user.company.id != admin_company.id:
            return Response(
                {"error": "Sadece kendi şirketinizdeki kullanıcıları güncelleyebilirsiniz."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Şirket değiştirilemez, her zaman admin'in şirketi olmalı
        request.data['company'] = admin_company.id
        
        # Rolleri güncelle
        if 'roles' in request.data:
            roles = request.data.get('roles', [])
            company_user.roles.clear()
            for role_id in roles:
                try:
                    role = Role.objects.get(id=role_id)
                    company_user.roles.add(role)
                except Role.DoesNotExist:
                    pass
        
        # Admin ve aktiflik durumunu güncelle
        company_user.is_admin = request.data.get('is_admin', company_user.is_admin)
        company_user.is_active = request.data.get('is_active', company_user.is_active)
        company_user.save()
        
        # Kullanıcı bilgilerini güncelle (eğer varsa)
        user_data = request.data.get('user')
        if user_data:
            user = company_user.user
            if 'email' in user_data:
                user.email = user_data['email']
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'password' in user_data and user_data['password']:
                user.set_password(user_data['password'])
            user.save()
        
        serializer = self.get_serializer(company_user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def admins(self, request):
        admins = CompanyUser.objects.filter(is_admin=True)
        serializer = self.get_serializer(admins, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def roles(self, request, pk=None):
        company_user = self.get_object()
        roles = company_user.roles.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['role_id'],
            properties={
                'role_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Rol ID', default=1),
            },
        )
    )
    @action(detail=True, methods=['post'])
    def add_role(self, request, pk=None):
        company_user = self.get_object()
        role_id = request.data.get('role_id')
        
        if not role_id:
            return Response({"error": "role_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            role = Role.objects.get(pk=role_id)
            company_user.roles.add(role)
            return Response({"status": "role added"}, status=status.HTTP_200_OK)
        except Role.DoesNotExist:
            return Response({"error": "role not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['role_id'],
            properties={
                'role_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Rol ID', default=1),
            },
        )
    )
    @action(detail=True, methods=['post'])
    def remove_role(self, request, pk=None):
        company_user = self.get_object()
        role_id = request.data.get('role_id')
        
        if not role_id:
            return Response({"error": "role_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            role = Role.objects.get(pk=role_id)
            company_user.roles.remove(role)
            return Response({"status": "role removed"}, status=status.HTTP_200_OK)
        except Role.DoesNotExist:
            return Response({"error": "role not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'query_type', 
                openapi.IN_QUERY, 
                description="Sorgu türü", 
                type=openapi.TYPE_STRING,
                default='traffic'
            )
        ]
    )
    @action(detail=True, methods=['get'])
    def check_permission(self, request, pk=None):
        company_user = self.get_object()
        query_type = request.query_params.get('query_type')
        
        if not query_type:
            return Response({"error": "query_type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        has_permission = company_user.has_permission(query_type)
        return Response({"has_permission": has_permission})

class InsuranceCompanyViewSet(viewsets.ModelViewSet):
    queryset = InsuranceCompany.objects.all().order_by('name')
    serializer_class = InsuranceCompanySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm sigorta şirketlerini pagination olmadan döndürür
        """
        insurance_companies = InsuranceCompany.objects.all()
        serializer = self.get_serializer(insurance_companies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        company = self.get_object()
        items = InsuranceCompanyItem.objects.filter(insurance_company=company)
        serializer = InsuranceCompanyItemSerializer(items, many=True)
        return Response(serializer.data)

class PartageViewSet(viewsets.ModelViewSet):
    queryset = Partage.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PartageDetailSerializer
        return PartageSerializer
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm partajları pagination olmadan döndürür
        """
        partages = Partage.objects.all()
        serializer = self.get_serializer(partages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related_companies(self, request, pk=None):
        partage = self.get_object()
        items = InsuranceCompanyItem.objects.filter(partage=partage)
        
        companies_data = []
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
            companies_data.append(company_data)
        
        return Response(companies_data)

class InsuranceCompanyItemViewSet(viewsets.ModelViewSet):
    queryset = InsuranceCompanyItem.objects.all().order_by('insurance_company__name')
    permission_classes = [AllowAny]
    pagination_class = None
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InsuranceCompanyItemCreateUpdateSerializer
        if self.action == 'retrieve':
            return InsuranceCompanyItemDetailSerializer
        return InsuranceCompanyItemSerializer
    
    @action(detail=False, methods=['get'])
    def all_items_no_pagination(self, request):
        """
        Tüm InsuranceCompanyItem'ları pagination olmadan döndürür
        """
        items = InsuranceCompanyItem.objects.all()
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active_items(self, request):
        active_items = InsuranceCompanyItem.objects.filter(is_active=True)
        serializer = self.get_serializer(active_items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def car_query_items(self, request):
        car_query_items = InsuranceCompanyItem.objects.filter(is_car_query=True)
        serializer = self.get_serializer(car_query_items, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'query_type', 
                openapi.IN_QUERY, 
                description="Sorgu türü", 
                type=openapi.TYPE_STRING,
                default='traffic'
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_query_type(self, request):
        query_type = request.query_params.get('query_type')
        if not query_type:
            return Response({"error": "query_type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        items = InsuranceCompanyItem.objects.filter(query_types__name=query_type)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'partage_id', 
                openapi.IN_QUERY, 
                description="Partaj ID'si", 
                type=openapi.TYPE_INTEGER,
                default=1
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_partage(self, request):
        partage_id = request.query_params.get('partage_id')
        if not partage_id:
            return Response({"error": "partage_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        items = InsuranceCompanyItem.objects.filter(partage__id=partage_id)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def same_partage_companies(self, request, pk=None):
        item = self.get_object()
        
        # Bu öğenin partajını al
        partage = item.partage
        
        if not partage:
            return Response([])
        
        # Aynı partaja sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(partage=partage).exclude(id=item.id).distinct()
        
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
                    'id': related_item.partage.id, 
                    'name': related_item.partage.name, 
                    'code': related_item.partage.code
                }
            }
            companies_data.append(company_data)
        
        return Response(companies_data)
    
    @action(detail=True, methods=['get'])
    def same_insurance_company_items(self, request, pk=None):
        item = self.get_object()
        
        # Bu öğenin partajını ve sigorta şirketini al
        partage = item.partage
        insurance_company = item.insurance_company
        
        if not partage or not insurance_company:
            return Response([])
        
        # Aynı partaja ve aynı sigorta şirketine sahip diğer öğeleri bul
        related_items = InsuranceCompanyItem.objects.filter(
            partage=partage,
            insurance_company=insurance_company
        ).exclude(id=item.id).distinct()
        
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
        
        return Response(items_data)
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'partage_id', 
                openapi.IN_QUERY, 
                description="Partaj ID'si", 
                type=openapi.TYPE_INTEGER,
                default=1
            ),
            openapi.Parameter(
                'insurance_company_id', 
                openapi.IN_QUERY, 
                description="Sigorta Şirketi ID'si", 
                type=openapi.TYPE_INTEGER,
                default=1
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def by_partage_and_insurance_company(self, request):
        partage_id = request.query_params.get('partage_id')
        insurance_company_id = request.query_params.get('insurance_company_id')
        
        if not partage_id:
            return Response({"error": "partage_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not insurance_company_id:
            return Response({"error": "insurance_company_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        items = InsuranceCompanyItem.objects.filter(
            partage__id=partage_id,
            insurance_company__id=insurance_company_id
        )
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['query_type_id'],
            properties={
                'query_type_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Sorgu Türü ID', default=1),
            },
        )
    )
    @action(detail=True, methods=['post'])
    def add_query_type(self, request, pk=None):
        item = self.get_object()
        query_type_id = request.data.get('query_type_id')
        
        if not query_type_id:
            return Response({"error": "query_type_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            query_type = QueryType.objects.get(pk=query_type_id)
            item.query_types.add(query_type)
            return Response({"status": "query type added"}, status=status.HTTP_200_OK)
        except QueryType.DoesNotExist:
            return Response({"error": "query type not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['query_type_id'],
            properties={
                'query_type_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='Sorgu Türü ID', default=1),
            },
        )
    )
    @action(detail=True, methods=['post'])
    def remove_query_type(self, request, pk=None):
        item = self.get_object()
        query_type_id = request.data.get('query_type_id')
        
        if not query_type_id:
            return Response({"error": "query_type_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            query_type = QueryType.objects.get(id=query_type_id)
            item.query_types.remove(query_type)
            return Response({"message": "Query type removed successfully"}, status=status.HTTP_200_OK)
        except QueryType.DoesNotExist:
            return Response({"error": "Query type not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['item_ids', 'partage'],
            properties={
                'item_ids': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description='Güncellenecek öğe ID\'leri',
                    default=[1, 2, 3]
                ),
                'partage': openapi.Schema(type=openapi.TYPE_INTEGER, description='Yeni partaj ID\'si', default=1),
            },
        )
    )
    @action(detail=False, methods=['post'])
    def bulk_update_partage(self, request):
        item_ids = request.data.get('item_ids', [])
        partage_id = request.data.get('partage')
        
        if not item_ids:
            return Response({"error": "item_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not partage_id:
            return Response({"error": "partage is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Partaj'ın var olup olmadığını kontrol et
            partage = Partage.objects.get(id=partage_id)
            
            # Sadece partaj alanını güncelle - diğer alanları dokunma
            updated_count = InsuranceCompanyItem.objects.filter(
                id__in=item_ids
            ).update(partage=partage)
            
            return Response({
                "message": f"{updated_count} adet öğe başarıyla güncellendi",
                "updated_count": updated_count,
                "partage": {
                    "id": partage.id,
                    "name": partage.name,
                    "code": partage.code
                }
            }, status=status.HTTP_200_OK)
            
        except Partage.DoesNotExist:
            return Response({"error": "Partage not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['partage'],
            properties={
                'partage': openapi.Schema(type=openapi.TYPE_INTEGER, description='Yeni partaj ID\'si', default=1),
            },
        )
    )
    @action(detail=True, methods=['patch'])
    def update_partage_only(self, request, pk=None):
        """
        Sadece partaj alanını günceller, diğer zorunlu alanları kontrol etmez
        """
        item = self.get_object()
        partage_id = request.data.get('partage')
        
        if not partage_id:
            return Response({"error": "partage is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Partaj'ın var olup olmadığını kontrol et
            partage = Partage.objects.get(id=partage_id)
            
            # Sadece partaj alanını güncelle
            item.partage = partage
            item.save(update_fields=['partage'])
            
            return Response({
                "message": "Partaj başarıyla güncellendi",
                "item_id": item.id,
                "partage": {
                    "id": partage.id,
                    "name": partage.name,
                    "code": partage.code
                }
            }, status=status.HTTP_200_OK)
            
        except Partage.DoesNotExist:
            return Response({"error": "Partage not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['cookie'],
            properties={
                'cookie': openapi.Schema(type=openapi.TYPE_STRING, description='Cookie metni', default='session_id=abc123; token=xyz789'),
            },
        )
    )
    @action(detail=True, methods=['post'])
    def update_cookie(self, request, pk=None):
        """
        Belirtilen InsuranceCompanyItem'ın cookie'sini günceller
        """
        item = self.get_object()
        cookie = request.data.get('cookie')
        
        if cookie is None:
            return Response({"error": "cookie is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Cookie'yi güncelle
            item.cookie = cookie
            item.save(update_fields=['cookie'])
            
            return Response({
                "message": "Cookie başarıyla güncellendi",
                "item_id": item.id,
                "cookie_length": len(cookie) if cookie else 0
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter(
            'username', 
            openapi.IN_QUERY, 
            description="Sigorta şirketi kullanıcı adı", 
            type=openapi.TYPE_STRING,
            required=True,
            default='AKS120'
        ),
        openapi.Parameter(
            'password', 
            openapi.IN_QUERY, 
            description="Sigorta şirketi şifresi", 
            type=openapi.TYPE_STRING,
            required=True,
            default='ardahan'
        )
    ],
    responses={
        200: openapi.Response(
            description='TOTP token başarıyla oluşturuldu',
            schema=openapi.Schema(type=openapi.TYPE_STRING, description='6 haneli TOTP kodu')
        ),
        400: openapi.Response(description='Eksik parametreler'),
        404: openapi.Response(description='Kullanıcı bulunamadı'),
        500: openapi.Response(description='TOTP secret bulunamadı veya hata oluştu'),
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def generate_totp(request):
    """
    Sigorta şirketi kullanıcı adı ve şifresi ile TOTP token üretir.
    InsuranceCompanyItem tablosundan totp_code (secret) bilgisini alır ve 6 haneli kod üretir.
    """
    try:
        username = request.query_params.get('username')
        password = request.query_params.get('password')
        
        if not username or not password:
            return Response(
                {"error": "username ve password parametreleri gereklidir."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # InsuranceCompanyItem'dan kullanıcı bilgilerini ara
        try:
            insurance_item = InsuranceCompanyItem.objects.get(
                username=username, 
                password=password
            )
            
            # TOTP secret kontrolü
            if not insurance_item.totp_code or insurance_item.totp_code.strip() == "":
                return Response(
                    {"error": "TOTP secret bulunamadı."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # TOTP token oluştur
            totp = pyotp.TOTP(insurance_item.totp_code)
            token = totp.now()
            
            return Response(int(token), status=status.HTTP_200_OK)
            
        except InsuranceCompanyItem.DoesNotExist:
            return Response(
                {"error": "Geçersiz kullanıcı adı veya şifre."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        return Response(
            {"error": "HATA: " + str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

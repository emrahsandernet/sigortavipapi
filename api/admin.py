from django.contrib import admin
from .models import Company, CompanyUser, InsuranceCompany, InsuranceCompanyItem, InsuranceCompanyCookie, Role, QueryType, RolePermission, Partage

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'user_limit', 'is_active', 'created_at', 'expires_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'code')
    date_hierarchy = 'created_at'

@admin.register(CompanyUser)
class CompanyUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'is_active', 'is_admin', 'created_at', 'expires_at')
    list_filter = ('is_active', 'is_admin', 'created_at')
    search_fields = ('user__username', 'user__email', 'company__name')
    date_hierarchy = 'created_at'
    filter_horizontal = ('roles',)

@admin.register(InsuranceCompany)
class InsuranceCompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'code')
    date_hierarchy = 'created_at'

@admin.register(InsuranceCompanyItem)
class InsuranceCompanyItemAdmin(admin.ModelAdmin):
    list_display = ('insurance_company', 'company', 'is_active', 'is_proxy_active', 'is_car_query', 'created_at')
    list_filter = ('is_active', 'is_proxy_active', 'is_car_query', 'cookie_use')
    search_fields = ('insurance_company__name', 'company__name')
    date_hierarchy = 'created_at'
    filter_horizontal = ('query_types', )

@admin.register(InsuranceCompanyCookie)
class InsuranceCompanyCookieAdmin(admin.ModelAdmin):
    list_display = ('insurance_company_item', 'name', 'domain', 'expires', 'http_only', 'secure', 'created_at')
    list_filter = ('http_only', 'secure', 'same_site', 'priority', 'created_at')
    search_fields = ('name', 'domain', 'insurance_company_item__insurance_company__name')
    date_hierarchy = 'created_at'
    raw_id_fields = ('insurance_company_item',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name',)
    date_hierarchy = 'created_at'

@admin.register(QueryType)
class QueryTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_name_display', 'description')
    list_filter = ('name',)
    search_fields = ('name', 'description')

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'query_type', 'can_query', 'can_create', 'can_update')
    list_filter = ('can_query', 'can_create', 'can_update', 'role', 'query_type')
    search_fields = ('role__name', 'query_type__name')

@admin.register(Partage)
class PartageAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'order', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'code')
    date_hierarchy = 'created_at'   

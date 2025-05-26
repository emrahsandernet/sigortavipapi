from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyViewSet, CompanyUserViewSet, InsuranceCompanyViewSet, InsuranceCompanyItemViewSet,
    RoleViewSet, QueryTypeViewSet, RolePermissionViewSet, PartageViewSet, company_login
)

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'company-users', CompanyUserViewSet)
router.register(r'insurance-companies', InsuranceCompanyViewSet)
router.register(r'insurance-company-items', InsuranceCompanyItemViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'query-types', QueryTypeViewSet)
router.register(r'role-permissions', RolePermissionViewSet)
router.register(r'partages', PartageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', company_login, name='company-login'),
] 
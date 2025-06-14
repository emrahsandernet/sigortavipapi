# Generated by Django 5.2.1 on 2025-05-17 15:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0007_insurancecompanyitem_password_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="insurancecompanyitem",
            name="partage",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                to="api.partage",
                verbose_name="Partaj",
            ),
        ),
        migrations.AlterField(
            model_name="insurancecompanyitem",
            name="sms_code",
            field=models.CharField(
                blank=True, max_length=255, null=True, verbose_name="SMS Kodu"
            ),
        ),
    ]

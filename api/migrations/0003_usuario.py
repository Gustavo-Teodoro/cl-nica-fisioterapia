from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_pagamento'),
    ]

    operations = [
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usuario', models.CharField(max_length=50, unique=True)),
                ('senha', models.CharField(max_length=128)),
                ('nome', models.CharField(max_length=100)),
                ('perfil', models.CharField(
                    choices=[
                        ('admin',    'Administrador — acesso total'),
                        ('clinica',  'Clínica — agenda e pacientes'),
                        ('contador', 'Contador — somente financeiro'),
                    ],
                    default='clinica',
                    max_length=20,
                )),
                ('ativo', models.BooleanField(default=True)),
            ],
            options={'ordering': ['usuario'], 'verbose_name': 'Usuário', 'verbose_name_plural': 'Usuários'},
        ),
        # Inserir o usuário admin padrão para não perder o acesso
        migrations.RunSQL(
            "INSERT INTO api_usuario (usuario, senha, nome, perfil, ativo) VALUES ('admin', '123', 'Administrador', 'admin', 1);",
            reverse_sql="DELETE FROM api_usuario WHERE usuario = 'admin';",
        ),
    ]

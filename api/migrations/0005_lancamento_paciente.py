from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_usuario_senha_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='lancamento',
            name='paciente',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='lancamentos',
                to='api.paciente',
            ),
        ),
        migrations.AlterField(
            model_name='lancamento',
            name='categoria',
            field=models.CharField(
                choices=[
                    ('Fisioterapia', 'Fisioterapia'),
                    ('Pilates', 'Pilates'),
                    ('Outros', 'Outros'),
                    ('Infraestrutura', 'Infraestrutura'),
                    ('Suprimentos', 'Suprimentos'),
                    ('Salário', 'Salário'),
                ],
                max_length=30,
            ),
        ),
    ]

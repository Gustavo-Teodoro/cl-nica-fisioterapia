from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paciente',
            name='pagamento_tipo',
            field=models.CharField(
                blank=True,
                choices=[('Particular', 'Particular'), ('Convênio', 'Convênio'), ('Ambos', 'Ambos')],
                max_length=20,
            ),
        ),
    ]

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_usuario'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='senha',
            field=models.CharField(max_length=64),
        ),
    ]

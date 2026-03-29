from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_lancamento_paciente'),
    ]

    operations = [
        # 1. Adiciona campos novos no Agendamento
        migrations.AddField(
            model_name='agendamento',
            name='paciente',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='agendamentos',
                to='api.paciente',
            ),
        ),
        migrations.AddField(
            model_name='agendamento',
            name='observacao',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AlterField(
            model_name='agendamento',
            name='status',
            field=models.CharField(
                choices=[
                    ('Confirmado', 'Confirmado'),
                    ('Aguardando', 'Aguardando'),
                    ('Realizado',  'Realizado'),
                    ('Faltou',     'Faltou'),
                    ('Cancelado',  'Cancelado'),
                ],
                default='Confirmado',
                max_length=20,
            ),
        ),

        # 2. Cria o model Pacote
        migrations.CreateModel(
            name='Pacote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('Fisioterapia', 'Fisioterapia'), ('Pilates', 'Pilates')], max_length=20)),
                ('total_sessoes', models.PositiveIntegerField()),
                ('sessoes_usadas', models.PositiveIntegerField(default=0)),
                ('valor_total', models.DecimalField(decimal_places=2, max_digits=10)),
                ('data_inicio', models.DateField()),
                ('data_vencimento', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('Ativo', 'Ativo'), ('Encerrado', 'Encerrado'), ('Vencido', 'Vencido')], default='Ativo', max_length=20)),
                ('observacao', models.TextField(blank=True)),
                ('data_cadastro', models.DateField(auto_now_add=True)),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pacotes', to='api.paciente')),
            ],
            options={'ordering': ['-data_cadastro'], 'verbose_name': 'Pacote', 'verbose_name_plural': 'Pacotes'},
        ),

        # 3. Adiciona campos em Lancamento
        migrations.AddField(
            model_name='lancamento',
            name='pacote',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='lancamentos',
                to='api.pacote',
            ),
        ),
        migrations.AddField(
            model_name='lancamento',
            name='agendamento',
            field=models.OneToOneField(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='lancamento',
                to='api.agendamento',
            ),
        ),

        # 4. Corrige CATEGORIA_CHOICES sem duplicatas
        migrations.AlterField(
            model_name='lancamento',
            name='categoria',
            field=models.CharField(
                choices=[
                    ('Fisioterapia', 'Fisioterapia'),
                    ('Pilates', 'Pilates'),
                    ('Infraestrutura', 'Infraestrutura'),
                    ('Suprimentos', 'Suprimentos'),
                    ('Salário', 'Salário'),
                    ('Outros', 'Outros'),
                ],
                max_length=30,
            ),
        ),
    ]

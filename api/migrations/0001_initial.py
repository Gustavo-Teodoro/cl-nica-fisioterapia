from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Paciente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=200)),
                ('cpf', models.CharField(blank=True, max_length=20, null=True, unique=True)),
                ('telefone', models.CharField(blank=True, max_length=20)),
                ('data_nascimento', models.DateField(blank=True, null=True)),
                ('idade', models.IntegerField(blank=True, null=True)),
                ('estado_civil', models.CharField(blank=True, choices=[('Solteiro(a)', 'Solteiro(a)'), ('Casado(a)', 'Casado(a)'), ('Divorciado(a)', 'Divorciado(a)'), ('Viúvo(a)', 'Viúvo(a)'), ('União estável', 'União estável')], max_length=30)),
                ('profissao', models.CharField(blank=True, max_length=100)),
                ('endereco', models.CharField(blank=True, max_length=300)),
                ('modalidade', models.CharField(blank=True, choices=[('Fisioterapia', 'Fisioterapia'), ('Pilates', 'Pilates'), ('Ambos', 'Ambos')], max_length=20)),
                ('pagamento_tipo', models.CharField(blank=True, choices=[('Particular', 'Particular'), ('Convênio', 'Convênio')], max_length=20)),
                ('convenio', models.CharField(blank=True, max_length=100)),
                ('diagnostico_medico', models.CharField(blank=True, max_length=300)),
                ('queixa_principal', models.TextField(blank=True)),
                ('diagnostico_fisio', models.TextField(blank=True)),
                ('exame_raio_x', models.BooleanField(default=False)),
                ('exame_rnm', models.BooleanField(default=False)),
                ('exame_tomografia', models.BooleanField(default=False)),
                ('exame_ecografia', models.BooleanField(default=False)),
                ('obs_exames', models.TextField(blank=True)),
                ('hs_cirurgia', models.BooleanField(default=False)),
                ('hs_hipertensao', models.BooleanField(default=False)),
                ('hs_diabetes', models.BooleanField(default=False)),
                ('hs_cardiaco', models.BooleanField(default=False)),
                ('hs_labirintite', models.BooleanField(default=False)),
                ('hs_fumante', models.BooleanField(default=False)),
                ('hs_perda_peso', models.BooleanField(default=False)),
                ('hs_febre', models.BooleanField(default=False)),
                ('hs_vomito', models.BooleanField(default=False)),
                ('hs_trauma', models.BooleanField(default=False)),
                ('hs_osteoporose', models.BooleanField(default=False)),
                ('alergia', models.CharField(blank=True, max_length=200)),
                ('outros_problemas', models.CharField(blank=True, max_length=200)),
                ('medicacao', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('Ativo', 'Ativo'), ('Inativo', 'Inativo')], default='Ativo', max_length=10)),
                ('data_cadastro', models.DateField(auto_now_add=True)),
                ('ultimo_atendimento', models.DateField(blank=True, null=True)),
            ],
            options={'ordering': ['nome'], 'verbose_name': 'Paciente', 'verbose_name_plural': 'Pacientes'},
        ),
        migrations.CreateModel(
            name='Agendamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paciente_nome', models.CharField(max_length=200)),
                ('data', models.DateField()),
                ('horario', models.TimeField()),
                ('tipo', models.CharField(choices=[('Fisioterapia', 'Fisioterapia'), ('Pilates', 'Pilates')], max_length=20)),
                ('profissional', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('Confirmado', 'Confirmado'), ('Aguardando', 'Aguardando'), ('Cancelado', 'Cancelado')], default='Confirmado', max_length=20)),
            ],
            options={'ordering': ['data', 'horario'], 'verbose_name': 'Agendamento', 'verbose_name_plural': 'Agendamentos'},
        ),
        migrations.CreateModel(
            name='Lancamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descricao', models.CharField(max_length=300)),
                ('tipo', models.CharField(choices=[('Receita', 'Receita'), ('Despesa', 'Despesa')], max_length=10)),
                ('valor', models.DecimalField(decimal_places=2, max_digits=10)),
                ('data', models.DateField()),
                ('categoria', models.CharField(choices=[('Consulta', 'Consulta'), ('Mensalidade', 'Mensalidade'), ('Infraestrutura', 'Infraestrutura'), ('Suprimentos', 'Suprimentos'), ('Salário', 'Salário'), ('Outros', 'Outros')], max_length=30)),
                ('status', models.CharField(choices=[('Pago', 'Pago'), ('Pendente', 'Pendente')], default='Pago', max_length=10)),
            ],
            options={'ordering': ['-data'], 'verbose_name': 'Lançamento', 'verbose_name_plural': 'Lançamentos'},
        ),
        migrations.CreateModel(
            name='Evolucao',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.DateField()),
                ('descricao', models.TextField()),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='evolucoes', to='api.paciente')),
            ],
            options={'ordering': ['data'], 'verbose_name': 'Evolução', 'verbose_name_plural': 'Evoluções'},
        ),
        migrations.CreateModel(
            name='ExamePDF',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome_original', models.CharField(max_length=255)),
                ('arquivo', models.FileField(upload_to='exames/')),
                ('data_upload', models.DateField(auto_now_add=True)),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exames_pdf', to='api.paciente')),
            ],
            options={'ordering': ['-data_upload'], 'verbose_name': 'Exame PDF', 'verbose_name_plural': 'Exames PDF'},
        ),
    ]

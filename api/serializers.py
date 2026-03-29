from rest_framework import serializers
from .models import Paciente, Agendamento, Evolucao, Lancamento, ExamePDF, Usuario, Pacote


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Usuario
        fields = ['id', 'usuario', 'senha', 'nome', 'perfil', 'ativo']

    def validate_usuario(self, value):
        if not value.strip():
            raise serializers.ValidationError('O nome de usuário não pode ser vazio.')
        return value.strip()

    def validate_senha(self, value):
        if len(value) < 3:
            raise serializers.ValidationError('A senha deve ter pelo menos 3 caracteres.')
        return value


class EvolucaoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Evolucao
        fields = '__all__'


class ExamePDFSerializer(serializers.ModelSerializer):
    arquivo_url = serializers.SerializerMethodField()

    class Meta:
        model  = ExamePDF
        fields = ['id', 'paciente', 'nome_original', 'arquivo_url', 'data_upload']

    def get_arquivo_url(self, obj):
        request = self.context.get('request')
        if obj.arquivo and request:
            return request.build_absolute_uri(obj.arquivo.url)
        return None


class PacoteSerializer(serializers.ModelSerializer):
    sessoes_restantes = serializers.ReadOnlyField()
    percentual_uso    = serializers.ReadOnlyField()
    paciente_nome     = serializers.SerializerMethodField()
    data_inicio       = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    data_vencimento   = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'], required=False, allow_null=True)

    class Meta:
        model  = Pacote
        fields = '__all__'

    def get_paciente_nome(self, obj):
        return obj.paciente.nome


class PacienteListSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Paciente
        fields = ['id', 'nome', 'cpf', 'telefone', 'modalidade', 'status', 'data_cadastro', 'ultimo_atendimento']


class PacienteDetalheSerializer(serializers.ModelSerializer):
    evolucoes  = EvolucaoSerializer(many=True, read_only=True)
    exames_pdf = ExamePDFSerializer(many=True, read_only=True)
    pacotes    = PacoteSerializer(many=True, read_only=True)

    data_nascimento = serializers.DateField(
        format='%Y-%m-%d',
        input_formats=['%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', 'iso-8601'],
        required=False,
        allow_null=True,
    )

    class Meta:
        model  = Paciente
        fields = '__all__'

    def validate_cpf(self, value):
        if value == '' or value is None:
            return None
        return value

    def validate(self, data):
        campos_choices = {
            'modalidade':     ['Fisioterapia', 'Pilates', 'Ambos', ''],
            'pagamento_tipo': ['Particular', 'Convênio', 'Ambos', ''],
            'estado_civil':   ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável', ''],
            'status':         ['Ativo', 'Inativo', ''],
        }
        for campo, validos in campos_choices.items():
            if campo in data and data[campo] not in validos:
                data[campo] = ''
        return data


class AgendamentoSerializer(serializers.ModelSerializer):
    data    = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    horario = serializers.TimeField(format='%H:%M', input_formats=['%H:%M', '%H:%M:%S'])
    paciente_nome_display = serializers.SerializerMethodField()

    class Meta:
        model  = Agendamento
        fields = '__all__'

    def get_paciente_nome_display(self, obj):
        return obj.paciente_nome


class LancamentoSerializer(serializers.ModelSerializer):
    data          = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    paciente_nome = serializers.SerializerMethodField()

    class Meta:
        model  = Lancamento
        fields = '__all__'

    def get_paciente_nome(self, obj):
        return obj.paciente.nome if obj.paciente else None

    def validate(self, data):
        tipo      = data.get('tipo', '')
        categoria = data.get('categoria', '')
        receita_cats = ['Fisioterapia', 'Pilates', 'Outros']
        despesa_cats = ['Infraestrutura', 'Suprimentos', 'Salário', 'Outros']
        if tipo == 'Receita' and categoria not in receita_cats:
            data['categoria'] = 'Outros'
        if tipo == 'Despesa' and categoria not in despesa_cats:
            data['categoria'] = 'Outros'
        return data

from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('login/',                              views.login,                name='login'),

    # Usuários
    path('usuarios/',                           views.usuarios_list,        name='usuarios-list'),
    path('usuarios/<int:pk>/',                  views.usuario_detail,       name='usuario-detail'),

    # Dashboard
    path('dashboard/',                          views.dashboard,            name='dashboard'),

    # Pacientes
    path('pacientes/',                          views.pacientes_list,       name='pacientes-list'),
    path('pacientes/<int:pk>/',                 views.paciente_detail,      name='paciente-detail'),

    # Agendamentos
    path('agendamentos/',                       views.agendamentos_list,    name='agendamentos-list'),
    path('agendamentos/<int:pk>/',              views.agendamento_detail,   name='agendamento-detail'),
    path('agendamentos/<int:pk>/checkin/',      views.checkin_agendamento,  name='agendamento-checkin'),

    # Pacotes de sessões
    path('pacotes/',                            views.pacotes_list,         name='pacotes-list'),
    path('pacotes/<int:pk>/',                   views.pacote_detail,        name='pacote-detail'),

    # Financeiro
    path('lancamentos/',                        views.lancamentos_list,     name='lancamentos-list'),
    path('lancamentos/<int:pk>/',               views.lancamento_detail,    name='lancamento-detail'),
    path('lancamentos/<int:pk>/pagar/',         views.marcar_pago,          name='lancamento-pagar'),

    # Evoluções
    path('evolucoes/',                          views.criar_evolucao,       name='evolucao-criar'),
    path('evolucoes/<int:pk>/',                 views.deletar_evolucao,     name='evolucao-deletar'),

    # Exames PDF
    path('exames/upload/',                      views.upload_exame,         name='exame-upload'),
    path('exames/<int:pk>/',                    views.deletar_exame,        name='exame-deletar'),

    # Importar ficha com IA
    path('importar-ficha/',                     views.importar_ficha,       name='importar-ficha'),
]

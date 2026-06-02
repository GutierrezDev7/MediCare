'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Bell, Shield, Accessibility, Users, Moon, Sun, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaregiverLink {
  id: number;
  relacionamento: string | null;
  criadoEm: string;
  cuidador: {
    id: number;
    nome: string;
    email: string;
    telefone?: string | null;
  };
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function SettingsView() {
  const { user, refreshUser, logout } = useAuth();
  const { preferences, updatePreferences } = usePreferences();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [caregivers, setCaregivers] = useState<CaregiverLink[]>([]);
  const [loadingCaregivers, setLoadingCaregivers] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCaregiverEmail, setNewCaregiverEmail] = useState('');
  const [newCaregiverRelation, setNewCaregiverRelation] = useState('');
  const [addingCaregiver, setAddingCaregiver] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setTelefone(user.telefone ? formatPhone(user.telefone) : '');
      setDataNascimento(formatDateForInput(user.dataNascimento));
    }
  }, [user]);

  const loadCaregivers = useCallback(async () => {
    if (!user || user.tipoPerfil !== 'PACIENTE') return;
    setLoadingCaregivers(true);
    const res = await api.caregivers.list();
    if (res.data) {
      setCaregivers(res.data.caregivers as CaregiverLink[]);
    }
    setLoadingCaregivers(false);
  }, [user]);

  useEffect(() => {
    loadCaregivers();
  }, [loadCaregivers]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const res = await api.auth.updateProfile({
      nome,
      telefone: telefone.replace(/\D/g, '') || null,
      dataNascimento: dataNascimento || null,
    });
    setSavingProfile(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Perfil atualizado com sucesso!');
    await refreshUser();
  };

  const handleChangePassword = async () => {
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    setChangingPassword(true);
    const res = await api.auth.changePassword({ senhaAtual, novaSenha, confirmarSenha });
    setChangingPassword(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Senha alterada com sucesso!');
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleExportData = async () => {
    setExporting(true);
    const res = await api.auth.exportData();
    setExporting(false);

    if (res.error || !res.data) {
      toast.error(res.error || 'Erro ao exportar dados');
      return;
    }

    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicare-dados-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Informe sua senha para confirmar');
      return;
    }

    setDeletingAccount(true);
    const res = await api.auth.deleteAccount(deletePassword);
    setDeletingAccount(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Conta excluída com sucesso');
    setDeleteDialogOpen(false);
    await logout();
  };

  const handleAddCaregiver = async () => {
    if (!newCaregiverEmail.trim()) {
      toast.error('Informe o e-mail do cuidador');
      return;
    }

    setAddingCaregiver(true);
    const res = await api.caregivers.add({
      cuidadorEmail: newCaregiverEmail.trim(),
      relacionamento: newCaregiverRelation.trim() || undefined,
    });
    setAddingCaregiver(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    toast.success('Cuidador adicionado com sucesso!');
    setAddDialogOpen(false);
    setNewCaregiverEmail('');
    setNewCaregiverRelation('');
    await loadCaregivers();
  };

  const handleRemoveCaregiver = async (id: number) => {
    const res = await api.caregivers.remove(id);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success('Cuidador removido');
    await loadCaregivers();
  };

  const isPatient = user?.tipoPerfil === 'PACIENTE';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Personalize sua experiência e configure preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
          <TabsList className="w-full justify-start sm:grid sm:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="profile" className="flex-1 min-w-[100px] sm:min-w-0">Perfil</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 min-w-[100px] sm:min-w-0">Notificações</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 min-w-[100px] sm:min-w-0">Segurança</TabsTrigger>
            <TabsTrigger value="accessibility" className="flex-1 min-w-[110px] sm:min-w-0">Acessibilidade</TabsTrigger>
            {isPatient && (
              <TabsTrigger value="caregivers" className="flex-1 min-w-[100px] sm:min-w-0">Cuidadores</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5 shrink-0" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(11) 98765-4321"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthdate">Data de Nascimento</Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar tema escuro para reduzir cansaço visual
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => updatePreferences({ darkMode: checked })}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>
              <Button
                className="w-full min-h-[44px]"
                onClick={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5 shrink-0" />
                Preferências de Notificações
              </CardTitle>
              <CardDescription>
                Configure como e quando receber lembretes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas no dispositivo
                  </p>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) => updatePreferences({ notificationsEnabled: checked })}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Som de Notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som ao receber lembrete
                  </p>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => updatePreferences({ soundEnabled: checked })}
                  disabled={!preferences.notificationsEnabled}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label>Tom de Notificação</Label>
                <Select
                  value={preferences.notificationTone}
                  onValueChange={(v) => updatePreferences({ notificationTone: v })}
                  disabled={!preferences.soundEnabled || !preferences.notificationsEnabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="gentle">Suave</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                    <SelectItem value="chime">Carrilhão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vibração</Label>
                  <p className="text-sm text-muted-foreground">
                    Vibrar ao receber lembrete
                  </p>
                </div>
                <Switch
                  checked={preferences.vibrationEnabled}
                  onCheckedChange={(checked) => updatePreferences({ vibrationEnabled: checked })}
                  disabled={!preferences.notificationsEnabled}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Antecedência do Lembrete</Label>
                <Select
                  value={preferences.reminderAdvance}
                  onValueChange={(v) => updatePreferences({ reminderAdvance: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No horário exato</SelectItem>
                    <SelectItem value="5">5 minutos antes</SelectItem>
                    <SelectItem value="10">10 minutos antes</SelectItem>
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Repetir Lembrete</Label>
                <Select
                  value={preferences.reminderRepeat}
                  onValueChange={(v) => updatePreferences({ reminderRepeat: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não repetir</SelectItem>
                    <SelectItem value="5">A cada 5 minutos</SelectItem>
                    <SelectItem value="10">A cada 10 minutos</SelectItem>
                    <SelectItem value="15">A cada 15 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">
                As preferências de notificação são salvas localmente neste dispositivo.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-5 w-5 shrink-0" />
                Segurança e Privacidade
              </CardTitle>
              <CardDescription>
                Proteja sua conta e seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Alterar Senha</h3>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="min-h-[44px]"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="min-h-[44px]"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="min-h-[44px]"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                  />
                </div>
                <Button
                  className="min-h-[44px]"
                  onClick={handleChangePassword}
                  disabled={changingPassword || !senhaAtual || !novaSenha}
                >
                  {changingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Alterar Senha
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-red-600">Zona de Perigo</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full min-h-[44px]"
                    onClick={handleExportData}
                    disabled={exporting}
                  >
                    {exporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Exportar Todos os Dados
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full min-h-[44px]"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Acessibilidade */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Accessibility className="h-5 w-5 shrink-0" />
                Opções de Acessibilidade
              </CardTitle>
              <CardDescription>
                Configure recursos para melhor experiência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4">
                <Label>Tamanho da Fonte</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Pequeno</span>
                  <Slider
                    value={[preferences.fontSize]}
                    onValueChange={([v]) => updatePreferences({ fontSize: v })}
                    min={12}
                    max={24}
                    step={2}
                    className="flex-1"
                  />
                  <span className="text-sm">Grande</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tamanho atual: {preferences.fontSize}px
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumentar contraste para melhor legibilidade
                  </p>
                </div>
                <Switch
  checked={preferences.highContrast}
  onCheckedChange={(checked) =>
    updatePreferences({ highContrast: checked })
  }
  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
/>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Suporte a Leitor de Tela</Label>
                  <p className="text-sm text-muted-foreground">
                    Otimizar interface para leitores de tela
                  </p>
                </div>
                <Switch
                  checked={preferences.screenReader}
                  onCheckedChange={(checked) => updatePreferences({ screenReader: checked })}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Animações Reduzidas</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimizar efeitos de movimento
                  </p>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => updatePreferences({ reducedMotion: checked })}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Comandos por Voz</Label>
                <Select
                  value={preferences.voiceCommands}
                  onValueChange={(v) => updatePreferences({ voiceCommands: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Desativado</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Controle o aplicativo usando comandos de voz (em breve)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cuidadores */}
        {isPatient && (
          <TabsContent value="caregivers" className="space-y-4">
            <Card>
              <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5 shrink-0" />
                  Gerenciar Cuidadores
                </CardTitle>
                <CardDescription>
                  Permita que familiares e cuidadores acompanhem suas medicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="flex items-center justify-between min-h-[44px]">
                  <div className="pr-4">
                    <Label className="text-base">Monitoramento Remoto</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que cuidadores vejam seu histórico
                    </p>
                  </div>
                  <Switch
                    checked={preferences.remoteMonitoring}
                    onCheckedChange={(checked) => updatePreferences({ remoteMonitoring: checked })}
                    className="scale-125 sm:scale-100"
                    className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4 text-base">Cuidadores Autorizados</h3>
                  {loadingCaregivers ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : caregivers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Nenhum cuidador vinculado. Adicione um cuidador pelo e-mail.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {caregivers.map((link) => (
                        <div
                          key={link.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3"
                        >
                          <div>
                            <p className="font-medium text-base">{link.cuidador.nome}</p>
                            <p className="text-sm text-muted-foreground">{link.cuidador.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {link.relacionamento || 'Cuidador'} • Adicionado em{' '}
                              {format(new Date(link.criadoEm), 'dd/MM/yyyy')}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto min-h-[40px]"
                            onClick={() => handleRemoveCaregiver(link.id)}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full min-h-[44px]"
                  onClick={() => setAddDialogOpen(true)}
                >
                  + Adicionar Cuidador
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-base">Configurações de Notificação para Cuidadores</h3>

                  <div className="flex items-center justify-between min-h-[44px]">
                    <div className="pr-4">
                      <Label className="text-base">Alertar sobre Doses Perdidas</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuidadores quando uma dose for perdida
                      </p>
                    </div>
                    <Switch
                      checked={preferences.alertMissedDoses}
                      onCheckedChange={(checked) => updatePreferences({ alertMissedDoses: checked })}
                      className="scale-125 sm:scale-100 data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600" 
                      
                    />
                  </div>

                  <div className="flex items-center justify-between min-h-[44px]">
                    <div className="pr-4">
                      <Label className="text-base">Relatórios Semanais</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar resumo semanal para cuidadores
                      </p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) => updatePreferences({ weeklyReports: checked })}
                      className="scale-125 sm:scale-100 data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between min-h-[44px]">
                    <div className="pr-4">
                      <Label className="text-base">Alertas de Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando medicamentos precisarem ser repostos
                      </p>
                    </div>
                    <Switch
                      checked={preferences.lowStockAlerts}
                      onCheckedChange={(checked) => updatePreferences({ lowStockAlerts: checked })}
                      className="scale-125 sm:scale-100 data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog: Adicionar Cuidador */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cuidador</DialogTitle>
            <DialogDescription>
              Informe o e-mail de um usuário com perfil de cuidador cadastrado no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="caregiver-email">E-mail do Cuidador</Label>
              <Input
                id="caregiver-email"
                type="email"
                placeholder="joao@medicare.com"
                value={newCaregiverEmail}
                onChange={(e) => setNewCaregiverEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caregiver-relation">Relacionamento (opcional)</Label>
              <Input
                id="caregiver-relation"
                placeholder="Filho, Cuidadora, Enfermeiro..."
                value={newCaregiverRelation}
                onChange={(e) => setNewCaregiverRelation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddCaregiver} disabled={addingCaregiver}>
              {addingCaregiver && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir Conta */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os seus medicamentos, histórico e dados serão
              removidos. Digite sua senha para confirmar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              type="password"
              placeholder="Sua senha"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePassword('')}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir Conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Eye, Clock, TrendingDown, TrendingUp, Zap, Star, Lock,
  UserCheck, Phone, Mail, Award, Activity, LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  computeAndSaveTrustScore, getTrustLevelLabel, getTrustLevelColor,
  getTrustLevelBg, type TrustScore, type TrustLevel
} from '../../services/trustScoreService';

interface Props {
  userId: string;
  userData: any;
}

const ScoreBar = ({ label, value, max = 20, color = 'bg-blue-500' }: { label: string; value: number; max?: number; color?: string }) => {
  const pct = Math.max(0, Math.min(100, Math.abs(value) / max * 100));
  const isNeg = value < 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 w-44 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${isNeg ? 'bg-red-500' : color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-10 text-right font-mono text-xs ${isNeg ? 'text-red-400' : 'text-white'}`}>{value > 0 ? '+' : ''}{value}</span>
    </div>
  );
};

export default function AdminUserTrustPanel({ userId, userData }: Props) {
  const [score, setScore] = useState<TrustScore | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalcLoading, setRecalcLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsSnap, ordersSnap, activitySnap] = await Promise.all([
        getDocs(query(collection(db, 'trustScoreLogs'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(20))).catch(() =>
          getDocs(query(collection(db, 'trustScoreLogs'), where('userId', '==', userId), limit(20)))
        ),
        getDocs(query(collection(db, 'orders'), where('sellerId', '==', userId), orderBy('createdAt', 'desc'), limit(20))).catch(() =>
          getDocs(query(collection(db, 'orders'), where('sellerId', '==', userId), limit(20)))
        ),
        getDocs(query(collection(db, 'adminLogs'), where('entityId', '==', userId), orderBy('createdAt', 'desc'), limit(20))).catch(() =>
          getDocs(query(collection(db, 'adminLogs'), where('entityId', '==', userId), limit(20)))
        ),
      ]);

      setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data() as any })));
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() as any })));
      setRecentActivity(activitySnap.docs.map(d => ({ id: d.id, ...d.data() as any })));

      // Mevcut trust score varsa kullan
      if (userData.trustScore !== undefined) {
        setScore({
          total: userData.trustScore || 0,
          level: userData.trustLevel || 'new',
          badges: (userData.trustBadges || []).map((id: string) => ({ id, label: id, color: 'gray', icon: 'shield' })),
          breakdown: userData.trustBreakdown || {},
          restrictions: userData.trustRestrictions || { maxActiveListings: null, msgLimitPerHour: null, withdrawDelayDays: 0, requiresManualReview: false, isUnderWatch: false },
          riskReasons: userData.trustRiskReasons || [],
          calculatedAt: userData.trustCalculatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        });
      }

      // Aynı IP / cihaz bağlantıları
      if (userData.lastIp || userData.deviceId) {
        const q = userData.lastIp
          ? query(collection(db, 'users'), where('lastIp', '==', userData.lastIp), limit(10))
          : query(collection(db, 'users'), limit(0));
        try {
          const linked = await getDocs(q);
          setLinkedAccounts(linked.docs.filter(d => d.id !== userId).map(d => ({ id: d.id, ...d.data() as any })));
        } catch { /* no-op */ }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    setRecalcLoading(true);
    try {
      const result = await computeAndSaveTrustScore(userId);
      if (result) {
        setScore(result);
        toast.success(`Güven puanı güncellendi: ${result.total}/100`);
        await loadData();
      }
    } catch (e: any) {
      toast.error('Hesaplama başarısız: ' + e.message);
    } finally {
      setRecalcLoading(false);
    }
  };

  const applyRestriction = async (key: string, val: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), { [key]: val, updatedAt: serverTimestamp() });
      toast.success('Kısıtlama uygulandı');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const level: TrustLevel = score?.level || userData.trustLevel || 'new';
  const totalScore = score?.total ?? userData.trustScore ?? null;

  return (
    <div className="space-y-4">
      {/* Skor başlığı */}
      <Card className="bg-[#1a1b23] border-white/10">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border ${getTrustLevelBg(level)}`}>
                <span className={getTrustLevelColor(level)}>{totalScore !== null ? totalScore : '—'}</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">{getTrustLevelLabel(level)}</p>
                <p className={`text-sm font-medium ${getTrustLevelColor(level)}`}>{level}</p>
                {score?.calculatedAt && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(score.calculatedAt), 'dd.MM.yyyy HH:mm', { locale: tr })}
                  </p>
                )}
              </div>
            </div>
            <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={recalculate} disabled={recalcLoading}>
              {recalcLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><RefreshCw className="w-4 h-4 mr-1.5" />Yeniden Hesapla</>}
            </Button>
          </div>

          {/* Risk nedenleri */}
          {(score?.riskReasons?.length || userData.trustRiskReasons?.length) ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(score?.riskReasons || userData.trustRiskReasons || []).map((r: string, i: number) => (
                <span key={i} className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-full px-2.5 py-1">
                  <AlertTriangle className="w-3 h-3" />{r}
                </span>
              ))}
            </div>
          ) : totalScore !== null ? (
            <div className="mt-3 flex items-center gap-1 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Risk tespit edilmedi
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Skor dökümü */}
      {score?.breakdown && (
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Puan Dökümü
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2.5">
            <ScoreBar label="Hesap Yaşı" value={score.breakdown.accountAge} max={12} color="bg-blue-500" />
            <ScoreBar label="E-posta Doğrulama" value={score.breakdown.emailVerified} max={8} color="bg-cyan-500" />
            <ScoreBar label="Telefon Doğrulama" value={score.breakdown.phoneVerified} max={10} color="bg-teal-500" />
            <ScoreBar label="Kimlik (KYC)" value={score.breakdown.kycVerified} max={20} color="bg-purple-500" />
            <ScoreBar label="Tamamlanan Siparişler" value={score.breakdown.completedOrders} max={20} color="bg-emerald-500" />
            <ScoreBar label="Ortalama Puan" value={score.breakdown.avgRating} max={10} color="bg-yellow-500" />
            {score.breakdown.cancelPenalty < 0 && <ScoreBar label="İptal Cezası" value={score.breakdown.cancelPenalty} max={15} />}
            {score.breakdown.disputePenalty < 0 && <ScoreBar label="Uyuşmazlık Cezası" value={score.breakdown.disputePenalty} max={20} />}
            {score.breakdown.complaintPenalty < 0 && <ScoreBar label="Şikayet Cezası" value={score.breakdown.complaintPenalty} max={15} />}
            {score.breakdown.chargebackPenalty < 0 && <ScoreBar label="Chargeback Cezası" value={score.breakdown.chargebackPenalty} max={10} />}
          </CardContent>
        </Card>
      )}

      {/* Kısıtlamalar */}
      <Card className="bg-[#1a1b23] border-white/10">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" /> Kısıtlamalar & Hızlı Aksiyonlar
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-gray-500">Max Aktif İlan</p>
              <p className="text-white font-bold">{userData.maxActiveListings ?? 'Sınırsız'}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-gray-500">Para Çekim Gecikmesi</p>
              <p className="text-white font-bold">{userData.withdrawDelayDays ?? 0} gün</p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-gray-500">Manuel İnceleme</p>
              <p className={`font-bold ${userData.requiresManualReview ? 'text-amber-400' : 'text-emerald-400'}`}>
                {userData.requiresManualReview ? 'Zorunlu' : 'Gerekmiyor'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-2.5">
              <p className="text-gray-500">İzleme Modu</p>
              <p className={`font-bold ${userData.isUnderWatch ? 'text-red-400' : 'text-emerald-400'}`}>
                {userData.isUnderWatch ? 'Aktif' : 'Pasif'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 h-7"
              onClick={() => applyRestriction('maxActiveListings', 3)}>
              <Lock className="w-3 h-3 mr-1" />İlan Kısıtla (3)
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-7"
              onClick={() => applyRestriction('withdrawDelayDays', 7)}>
              <Clock className="w-3 h-3 mr-1" />7 Gün Çekim Beklet
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 h-7"
              onClick={() => applyRestriction('isUnderWatch', true)}>
              <Eye className="w-3 h-3 mr-1" />İzlemeye Al
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-7"
              onClick={() => applyRestriction('requiresManualReview', false)}>
              <CheckCircle className="w-3 h-3 mr-1" />Kısıt Kaldır
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Son 20 Hareket */}
      <Card className="bg-[#1a1b23] border-white/10">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Son 20 Hareket
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <ScrollArea className="h-48">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Hareket bulunamadı</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-400">{a.action}</span>
                    <span className="text-gray-600 shrink-0">
                      {a.createdAt?.toDate?.() ? format(a.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Aynı IP / Cihaz Hesapları */}
      {linkedAccounts.length > 0 && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-red-400 text-sm font-semibold flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Bağlantılı Hesaplar ({linkedAccounts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {linkedAccounts.map(u => (
              <div key={u.id} className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <p className="text-white">{u.username || u.email}</p>
                  <p className="text-gray-500 text-xs">Aynı IP: {u.lastIp}</p>
                </div>
                <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">Şüpheli</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Puan değişim logu */}
      {logs.length > 0 && (
        <Card className="bg-[#1a1b23] border-white/10">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-white text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Puan Değişim Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            {logs.map(l => {
              const delta = l.newScore - l.prevScore;
              return (
                <div key={l.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
                  <div>
                    <span className="text-gray-400">{l.prevScore} → {l.newScore}</span>
                    {l.riskReasons?.[0] && <span className="text-gray-600 ml-2">({l.riskReasons[0]})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {delta >= 0 ? '+' : ''}{delta}
                    </span>
                    <span className="text-gray-600">
                      {l.createdAt?.toDate?.() ? format(l.createdAt.toDate(), 'dd.MM HH:mm', { locale: tr }) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

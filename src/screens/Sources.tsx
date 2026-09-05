import { useState } from 'react';
import { Plus, X, KeyRound, Loader2, CheckCircle2, Plug, RefreshCw, Settings2 } from 'lucide-react';
import { SOURCES_INIT, type SourceItem } from '../data';
import { Badge, Btn, Card, Modal, Field, inputCls, useToast } from '../components/ui';

const PROVIDERS = [
  { id: 'af', name: 'AppsFlyer', desc: 'Мобильная атрибуция', hue: 340, letter: 'AF' },
  { id: 'ym', name: 'Яндекс Метрика', desc: 'Веб-аналитика', hue: 45, letter: 'Я' },
  { id: 'ga', name: 'Google Analytics 4', desc: 'Событийная аналитика', hue: 25, letter: 'GA' },
  { id: 'vk', name: 'VK Реклама', desc: 'Статистика посевов', hue: 215, letter: 'VK' },
  { id: 'mt', name: 'MyTracker', desc: 'Атрибуция Mail.ru', hue: 265, letter: 'MT' },
  { id: 'tg', name: 'Telegram Ads', desc: 'Реклама в каналах', hue: 195, letter: 'TG' },
];

export default function Sources() {
  const toast = useToast();
  const [sources, setSources] = useState<SourceItem[]>(SOURCES_INIT);
  const [modal, setModal] = useState<null | { provider?: string }>(null);

  return (
    <div className="h-full overflow-y-auto scroll-thin">
      <div className="px-6 pt-5 pb-4 bg-gradient-to-b from-white to-transparent">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-display font-semibold text-gray-900">Источники аналитики</h1>
            <p className="text-[12.5px] font-medium text-gray-400 mt-1">Подключения к системам атрибуции и счётчикам · {sources.filter(s => s.status === 'active').length} из {sources.length} активны</p>
          </div>
          <Btn onClick={() => setModal({})}><Plus size={14} />Подключить источник</Btn>
        </div>
      </div>
      <div className="px-6 pb-6 grid grid-cols-3 gap-4 stagger">
        {sources.map(s => (
          <Card key={s.id} className={`p-4 hover:shadow-md transition-all ${s.status === 'error' ? 'border-red-200' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, hsl(${s.hue} 75% 52%), hsl(${s.hue + 25} 70% 42%))` }}>{s.letter}</div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.status === 'active' ? 'bg-emerald-500' : s.status === 'error' ? 'bg-red-500 pulse-red' : 'bg-gray-300'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-bold text-gray-900 truncate">{s.name}</div>
                <div className="text-[11.5px] font-medium text-gray-400">{s.desc}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {s.status === 'active' && <Badge tone="green" dot>Активно</Badge>}
              {s.status === 'error' && <Badge tone="red" dot>Ошибка подключения</Badge>}
              {s.status === 'off' && <Badge tone="gray" dot>Не подключён</Badge>}
              <span className="text-[11px] font-semibold text-gray-400 truncate">{s.metrics}</span>
            </div>
            <div className="flex gap-2 mt-3.5">
              {s.status === 'active' && <>
                <Btn variant="secondary" size="sm" className="flex-1" onClick={() => toast('info', `Синхронизация ${s.name} запущена`)}><RefreshCw size={13} />Синхронизировать</Btn>
                <Btn variant="ghost" size="sm" onClick={() => toast('info', `Настройки ${s.name}`)}><Settings2 size={13} /></Btn>
              </>}
              {s.status === 'error' && (
                <Btn variant="danger" size="sm" className="flex-1" onClick={() => {
                  setSources(src => src.map(x => x.id === s.id ? { ...x, status: 'active' as const, metrics: 'Переподключено · данные за 90 дней' } : x));
                  toast('ok', `${s.name} переподключён, токен обновлён`);
                }}><Plug size={13} />Исправить</Btn>
              )}
              {s.status === 'off' && (
                <Btn variant="outline" size="sm" className="flex-1" onClick={() => setModal({ provider: s.name === 'VK Реклама' ? 'vk' : s.name === 'MyTracker' ? 'mt' : 'ga' })}>
                  <Plus size={13} />Подключить
                </Btn>
              )}
            </div>
          </Card>
        ))}
        <button onClick={() => setModal({})} className="rounded-xl border-2 border-dashed border-gray-200 min-h-[150px] flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-[12.5px] font-bold">
          <Plus size={18} />Добавить источник
        </button>
      </div>

      {modal && <ConnectModal initial={modal.provider} onClose={() => setModal(null)} onDone={(name, p) => {
        setSources(src => {
          const exists = src.find(x => x.name === name);
          if (exists) return src.map(x => x.id === exists.id ? { ...x, status: 'active' as const, metrics: 'Подключено только что' } : x);
          return [...src, { id: 's' + Date.now(), name, desc: p.desc, status: 'active' as const, metrics: 'Подключено только что', hue: p.hue, letter: p.letter }];
        });
        setModal(null);
        toast('ok', `${name} подключён — первая синхронизация началась`);
      }} />}
    </div>
  );
}

function ConnectModal({ initial, onClose, onDone }: { initial?: string; onClose: () => void; onDone: (name: string, p: (typeof PROVIDERS)[0]) => void }) {
  const [step, setStep] = useState(initial ? 1 : 0);
  const [prov, setProv] = useState(initial ?? '');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<null | 'ok' | 'err'>(null);
  const provider = PROVIDERS.find(p => p.id === prov);

  const runTest = () => {
    setTesting(true); setResult(null);
    setTimeout(() => {
      setTesting(false);
      setResult(apiKey.trim().length >= 6 ? 'ok' : 'err');
    }, 1600);
  };

  return (
    <Modal onClose={onClose} w="max-w-[600px]">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center">
        <div>
          <h2 className="text-[15.5px] font-bold text-gray-900">Подключить источник</h2>
          <p className="text-[12px] font-medium text-gray-400 mt-0.5">Шаг {step + 1} из 3 · {['Выбор провайдера', 'Настройка', 'Проверка'][step]}</p>
        </div>
        <button onClick={onClose} className="ml-auto text-gray-300 hover:text-gray-600"><X size={18} /></button>
      </div>
      <div className="p-5 min-h-[320px]">
        {step === 0 && (
          <div className="grid grid-cols-3 gap-3 anim-in">
            {PROVIDERS.map(p => (
              <button key={p.id} onClick={() => { setProv(p.id); setStep(1); }}
                className="rounded-xl border-2 border-gray-200 p-4 text-center hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-xl mx-auto flex items-center justify-center text-[11px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, hsl(${p.hue} 75% 52%), hsl(${p.hue + 25} 70% 42%))` }}>{p.letter}</div>
                <div className="text-[12.5px] font-bold text-gray-900 mt-2">{p.name}</div>
                <div className="text-[10.5px] font-semibold text-gray-400">{p.desc}</div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && provider && (
          <div className="max-w-md mx-auto anim-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-extrabold text-white" style={{ background: `linear-gradient(135deg, hsl(${provider.hue} 75% 52%), hsl(${provider.hue + 25} 70% 42%))` }}>{provider.letter}</div>
              <div><div className="text-[14px] font-bold text-gray-900">{provider.name}</div><div className="text-[11.5px] font-medium text-gray-400">{provider.desc}</div></div>
            </div>
            <div className="flex flex-col gap-4">
              <Field label="API Key / OAuth токен" hint={provider.id === 'ga' ? 'Токен можно отозвать в любой момент в аккаунте Google' : 'Найдите ключ в настройках интеграций вашего кабинета'}>
                <div className="relative">
                  <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input className={inputCls + ' !pl-9 font-mono'} placeholder="af_x4k9-2mz8-…" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                </div>
              </Field>
              {['Импортировать события конверсий', 'Синхронизировать аудитории', 'Автообновление каждые 6 часов'].map((c, i) => (
                <label key={i} className="flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-indigo-500" />{c}
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 2 && provider && (
          <div className="max-w-md mx-auto text-center py-6 anim-in">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${result === 'ok' ? 'bg-emerald-50' : result === 'err' ? 'bg-red-50' : 'bg-indigo-50'}`}>
              {testing ? <Loader2 size={28} className="text-indigo-500 animate-spin" />
                : result === 'ok' ? <CheckCircle2 size={28} className="text-emerald-500" />
                  : result === 'err' ? <X size={28} className="text-red-500" />
                    : <Plug size={28} className="text-indigo-400" />}
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 mt-3.5">
              {testing ? 'Проверяем подключение…' : result === 'ok' ? 'Подключение успешно!' : result === 'err' ? 'Не удалось подключиться' : `Подключение к ${provider.name}`}
            </h3>
            <p className="text-[12.5px] font-medium text-gray-400 mt-1.5 leading-relaxed">
              {testing ? 'Отправляем тестовый запрос к API и проверяем права доступа'
                : result === 'ok' ? 'Получено 12 событий за последние 24 часа. Можно завершать настройку.'
                  : result === 'err' ? 'API вернул 401 Unauthorized. Проверьте ключ — он должен быть не короче 6 символов.'
                    : 'Нажмите «Проверить», чтобы выполнить тестовый запрос к API'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              {!testing && result !== 'ok' && <Btn variant="secondary" onClick={runTest}><Plug size={14} />{result === 'err' ? 'Повторить проверку' : 'Проверить подключение'}</Btn>}
              {result === 'ok' && <Btn onClick={() => onDone(provider.name, provider)}><CheckCircle2 size={14} />Завершить подключение</Btn>}
            </div>
          </div>
        )}
      </div>
      <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-slate-50/50">
        <Btn variant="ghost" onClick={() => (step === 0 ? onClose() : setStep(s => s - 1))}>{step === 0 ? 'Отмена' : 'Назад'}</Btn>
        {step === 1 && <Btn onClick={() => setStep(2)}>Далее</Btn>}
      </div>
    </Modal>
  );
}

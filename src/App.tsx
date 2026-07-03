import { useEffect, useState } from "react";
import {
  adminLogin,
  clearToken,
  createOperator,
  deleteOperator,
  getToken,
  listOperators,
  Operator,
} from "./api";

const ROLES = [
  { id: "boat", label: "Водитель катера" },
  { id: "jetski", label: "Водитель гидроцикла" },
  { id: "jetsurf", label: "Оператор JET SURF" },
  { id: "sup", label: "Оператор саппборда" },
];

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [password, setPassword] = useState("");
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "boat",
  });

  async function loadOperators() {
    setLoading(true);
    setError("");
    try {
      setOperators(await listOperators());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) loadOperators();
  }, [authed]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await adminLogin(password);
      setAuthed(true);
    } catch {
      setError("Неверный пароль");
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const created = await createOperator(form);
      setCreatedKey(created.login_key);
      setForm({ first_name: "", last_name: "", role: "boat" });
      setShowCreate(false);
      await loadOperators();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось создать");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Удалить оператора? Ключ перестанет работать.")) return;
    await deleteOperator(id);
    await loadOperators();
  }

  if (!authed) {
    return (
      <div className="page center">
        <form className="card login" onSubmit={onLogin}>
          <h1>Bigsup Admin</h1>
          <p>Вход для администратора</p>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Войти</button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Bigsup Admin</h1>
          <p>Операторы пляжа</p>
        </div>
        <button
          className="ghost"
          onClick={() => {
            clearToken();
            setAuthed(false);
          }}
        >
          Выйти
        </button>
      </header>

      <section className="toolbar">
        <button onClick={() => setShowCreate(true)}>+ Создать оператора</button>
        <button className="ghost" onClick={loadOperators}>
          Обновить
        </button>
      </section>

      {createdKey && (
        <div className="banner">
          Новый ключ для входа в приложение: <strong>{createdKey}</strong>
          <button className="ghost" onClick={() => setCreatedKey("")}>
            Скрыть
          </button>
        </div>
      )}

      {error && <div className="error block">{error}</div>}
      {loading && <p>Загрузка...</p>}

      <div className="grid">
        {operators.map((op) => (
          <article className="card operator" key={op.id}>
            <div className="operator-head">
              <h2>
                {op.first_name} {op.last_name}
              </h2>
              <span className="pill">{op.role_label}</span>
            </div>
            <div className="key-row">
              <span>Ключ</span>
              <code>{op.login_key}</code>
            </div>
            <div className="meta">Создан: {op.created_at}</div>
            <button className="danger" onClick={() => onDelete(op.id)}>
              Удалить
            </button>
          </article>
        ))}
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <form
            className="card modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onCreate}
          >
            <h2>Новый оператор</h2>
            <label>
              Имя
              <input
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Фамилия
              <input
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                required
              />
            </label>
            <label>
              Роль
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost" onClick={() => setShowCreate(false)}>
                Отмена
              </button>
              <button type="submit">Создать</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

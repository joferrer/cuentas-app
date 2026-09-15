import { useAuthStore } from '../store/authStore'

export function LoginScreen() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const error = useAuthStore((s) => s.error)

  return (
    <div className="min-h-dvh bg-paper flex flex-col items-center justify-center px-6 text-ink">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="grid place-items-center w-14 h-14 rounded-2xl bg-green-900 text-paper text-2xl font-display font-semibold">
            $
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold leading-tight">Cuentas Claras</h1>
            <p className="text-sm text-ink-soft">báscula, precios y compras</p>
          </div>
        </div>

        <div className="bg-white/60 border border-line rounded-2xl p-6">
          <p className="text-ink-soft text-sm mb-6 leading-relaxed">
            Saca cuentas por libra, kilo, gramo o unidad al instante. Registra tus productos y lleva el inventario
            de tu negocio, tu casa, o lo que necesites — todo se guarda en tu cuenta de Google.
          </p>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-green-900 text-paper font-medium py-3.5 hover:bg-green-700 transition-colors"
          >
            <GoogleIcon />
            Entrar con Google
          </button>

          {error && <p className="text-brick-600 text-sm mt-4">{error}</p>}
        </div>

        <p className="text-xs text-ink-soft/70 mt-6 text-center">
          Tus productos y compras se guardan en la nube y funcionan sin conexión.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"
      />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 35.7 26.9 36.7 24 36.7c-5.2 0-9.6-3.3-11.2-7.9l-6.6 5.1C9.5 40.6 16.2 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.2 35.9 44 30.3 44 24c0-1.4-.1-2.5-.4-3.5z" />
    </svg>
  )
}

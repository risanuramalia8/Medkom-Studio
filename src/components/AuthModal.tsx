import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { User } from '../types/database';
import { db } from '../services/relationalStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSelectUser }) => {
  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state: username & password
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state (for "Buat Akun")
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNim, setRegNim] = useState('');
  const [regProdi, setRegProdi] = useState('D-III Kesehatan Gigi');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputId = usernameOrEmail.trim();
    if (!inputId) {
      setErrorMsg('Silakan masukkan username atau email Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi akun Anda.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser = db.authenticate(inputId, password);

      if (!authenticatedUser) {
        setErrorMsg('Username atau kata sandi tidak sesuai. Untuk akun Super Admin gunakan username "superadmin" dan sandi "superadmin".');
        return;
      }

      // Successful login
      db.setActiveUser(authenticatedUser);
      db.addAuditLog({
        action: 'Pengguna Masuk Sistem',
        details: `${authenticatedUser.name} (${authenticatedUser.role}) berhasil masuk ke sistem.`,
        category: 'auth',
        performedBy: authenticatedUser.name,
      });

      onSelectUser(authenticatedUser);
      onClose();
    }, 250);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim()) {
      setErrorMsg('Silakan masukkan nama lengkap Anda.');
      return;
    }

    const email =
      regEmail.trim() ||
      `${regName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@mhs.poltekkespalembang.ac.id`;

    const newUser = db.registerUser({
      name: regName.trim(),
      email,
      role: 'mahasiswa',
      nim: regNim.trim() || `PO.71.25.1.24.${Math.floor(100 + Math.random() * 900)}`,
      prodi: regProdi,
    });

    db.addAuditLog({
      action: 'Registrasi Akun Baru',
      details: `Akun mahasiswa ${newUser.name} (${newUser.nim}) terdaftar di sistem.`,
      category: 'auth',
      performedBy: newUser.name,
    });

    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-[420px] w-full shadow-2xl border border-slate-200 overflow-hidden relative text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer z-10"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Body */}
        <div className="p-6 pt-7">
          <div className="mb-5 pr-8">
            <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight">
              {mode === 'login' ? 'Masuk ke Sistem' : 'Buat Akun Baru'}
            </h2>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {mode === 'login' ? (
            /* PROFESSIONAL LOGIN FORM: USERNAME, PASSWORD, BUAT AKUN */
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Username atau Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Contoh: superadmin atau email Anda"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] focus:border-transparent transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#265cb0] focus:ring-[#3270c4] border-slate-300"
                  />
                  <span className="text-slate-600">Ingat kredensial saya</span>
                </label>
                <span className="text-slate-400 text-[11px]">Akses Terenkripsi</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#265cb0] hover:bg-[#1e4b8f] active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <span>Memproses Masuk...</span>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Action: Buat Akun */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-xs">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode('register');
                    }}
                    className="font-bold text-[#265cb0] hover:text-[#1e4b8f] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Buat Akun</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM: BUAT AKUN */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <p className="text-slate-500 leading-relaxed text-xs">
                Lengkapi data diri Anda di bawah ini untuk membuat akun mahasiswa / kreator karya:
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Mahasiswa:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Ilham"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Mahasiswa (Opsional):
                </label>
                <input
                  type="email"
                  placeholder="nama.mahasiswa@mhs.poltekkespalembang.ac.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIM Mahasiswa:
                </label>
                <input
                  type="text"
                  placeholder="PO.71.25.1.24.xxx"
                  value={regNim}
                  onChange={(e) => setRegNim(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Program Studi:
                </label>
                <select
                  value={regProdi}
                  onChange={(e) => setRegProdi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] transition-all"
                >
                  <option value="D-III Kesehatan Gigi">D-III Kesehatan Gigi</option>
                  <option value="Sarjana Terapan Terapi Gigi">Sarjana Terapan Terapi Gigi</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Buat kata sandi minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3270c4] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Register Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Daftar Akun Baru</span>
              </button>

              {/* Back to Login */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-xs">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setMode('login');
                    }}
                    className="font-bold text-[#265cb0] hover:text-[#1e4b8f] hover:underline cursor-pointer"
                  >
                    Masuk Sekarang
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Institutional note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sistem Informasi Medkom Studio</span>
            <span className="flex items-center gap-1 text-slate-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Akses Terlindungi
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Monitor,
  ClipboardList,
  DollarSign,
  Wrench,
  Menu,
  X,
  Tag,
  TagIcon,
  Package,
  LogOut,
  Gamepad2
} from "lucide-react";

export default function Header() {

    const [isGeren, setIsGeren] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router   = useRouter();

    function toggleMenu() { setIsOpen(!isOpen); }
    function closeMenu()  { setIsOpen(false); }

    function handleSair() {
        localStorage.removeItem("auth");
        router.push("/login");
    }

    return (
        <>
            {/* Botão hamburguer - só mobile */}
            <button className={styles.menuButton} onClick={toggleMenu}>
                {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay mobile */}
            {isOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>

                {/* Topo */}
                <div className={styles.top}>
                    <div className={styles.logoArea}>
                        <div className={styles.logoIcon}>
                            <img src="./img/izc.webp" alt="Logo" height={100}/>
                        </div>
                        <div>
                            <h2>Izael Tec</h2>
                            <span>Assistência Técnica</span>
                        </div>
                    </div>
                </div>

                {/* Nav padrão */}
                {!isGeren && (
                    <nav className={styles.nav}>
                        <Link 
                            href="/" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
                        >
                            <LayoutDashboard size={18} /> <span>Dashboard</span>
                        </Link>

                        <Link 
                            href="/clientes" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/clientes' ? styles.active : ''}`}
                        >
                            <Users size={18} /> <span>Clientes</span>
                        </Link>

                        <Link 
                            href="/equipamentos" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/equipamentos' ? styles.active : ''}`}
                        >
                            <Monitor size={18} /> <span>Equipamentos</span>
                        </Link>

                        <Link 
                            href="/ordem" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/ordens' ? styles.active : ''}`}
                        >
                            <ClipboardList size={18} /> <span>Ordens de Serviço</span>
                        </Link>

                        <Link 
                            href="/tecnicos" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/tecnicos' ? styles.active : ''}`}
                        >
                            <Wrench size={18} /> <span>Técnicos</span>
                        </Link>
                        <Link 
                            href="/tags" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/tags' ? styles.active : ''}`}
                        >
                            <TagIcon size={18} /> <span>Tags</span>
                        </Link>

                        <Link 
                            href="/produtos" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/produtos' ? styles.active : ''}`}
                        >
                            <Package size={18} /> <span>Produtos</span>
                        </Link>



                        <Link 
                            href="/financeiro" 
                            onClick={closeMenu}
                            className={`${styles.link} ${pathname === '/financeiro' ? styles.active : ''}`}
                        >
                            <DollarSign size={18} /> <span>Financeiro</span>
                        </Link>

                        <button className={styles.btnSair} onClick={handleSair}>
                            <LogOut size={16} /> <span>Sair</span>
                        </button>
                    </nav>
                )}

            </aside>
        </>
    );
}
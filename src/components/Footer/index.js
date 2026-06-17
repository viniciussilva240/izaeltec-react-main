'use client'
import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.fo}>
            <div className={styles.dives}>
                <p className={styles.wha}>+55 69 9213-5608</p>
                <p className={styles.insta}>@IZAELTEC</p>
                <p>&2025 IZAELTEC — TODOS OS DIREITOS RESERVADOS</p>
            </div>
        </footer>
    );
}

import styles from './Card.module.css';

export default function Card({id, nome, preco}) {
    return (
        <div className={styles.divCard}>
            <h2>Código {id}</h2>
            <p>Produto: {nome}</p>
            <p>Valor: {preco}</p>
        </div>
    )
}
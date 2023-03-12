import { Outlet } from 'react-router-dom';
import { Header } from '@/components';

import styles from './styles.module.scss';

export default function PageContainer() {
	return (
		<div className={styles.pageContainer}>
			<Header />
			<main className={styles.pageContainerMain}>
				<Outlet />
			</main>
		</div>
	);
}

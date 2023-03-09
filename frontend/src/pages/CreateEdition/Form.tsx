import { useCallback } from 'react';
import { useGetSetState } from 'react-use';
import { Formik } from 'formik';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import styles from '@/pages/CreateEdition/styles.module.scss';
import { isTestnet } from '@/helpers/location';

import { FormArea } from '@/pages/CreateEdition/FormArea';
import { formSchema } from '@/pages/CreateEdition/validation';
import { FormValues } from '@/pages/CreateEdition/interfaces';
import { Preview } from '@/pages/CreateEdition/Preview';
import { EDITIONS_SIZES, TELEGRAM_WEB_APP_ACTION } from '@/constants/common';
import { useTelegram, useTonClient } from '@/hooks';
import { createEdition } from '@/pages/CreateEdition/helpers';
import { dateToUnix } from '@/helpers';
import { Address } from 'ton-core';
import { sendMessageToChat } from '@/libs/apiClient';
import { composeFullEditionAddress } from '@/utils';

const initialDeploymentState = {
	isModalOpened: false,
	address: '',
	editionName: '',
};

function getTestnetInitialValues(address: string) {
	return {
		name: 'TestOne',
		symbol: '$TST',
		description: 'Hello, this is description',
		media: null,
		price: '1',
		editionSize: {
			type: EDITIONS_SIZES.OPEN_EDITION,
			amount: '',
		},
		royalty: '2',
		validity: {
			start: null,
			end: null,
		},
		payoutAddress: address,
	};
}

function CreateEditionForm() {
	const address = useTonAddress();
	const tonClient = useTonClient();
	const [tonConnectUI] = useTonConnectUI();
	const [getdeploymentState, setDeploymentState] = useGetSetState(initialDeploymentState);

	const telegram = useTelegram();
	console.log('telegram', telegram)

	const sendEditionUrlToTelegram = useCallback((editionAddress: string, edtionName: string) => {
		if(!telegram.user) return;

		const edtionFullAddress = composeFullEditionAddress(editionAddress);

		const message = {
			action: TELEGRAM_WEB_APP_ACTION.EDITION_MINT,
			payload: {
				chatId: telegram.user.id,
				message: `
				Here is the link to your newly created ${edtionName} NFT edtion 🚀🚀🚀
				${edtionFullAddress}
				`	
			}
		};

		console.log('message', message)

		sendMessageToChat(message);
	}, [sendMessageToChat, telegram.user]);

	const handleConnectWalletClick = useCallback(async () => {
		if (!tonConnectUI.connected) {
			try {
				await tonConnectUI.connectWallet();
			} catch (error) {
				console.error('Error occured when connecting to wallet', error);

				throw error;
			}
		}
	}, [tonConnectUI.connected]);

	const handleSubmit = useCallback(
		async (values: FormValues, bag: { setSubmitting: (arg0: boolean) => void }) => {
			if (!tonClient) return;
			const turnOffSubmition = () => bag.setSubmitting(false);

			bag.setSubmitting(true);
			let creatorAddress = address;
			try {
				if (!tonConnectUI.connected) {
					try {
						let result = await tonConnectUI.connectWallet();
						creatorAddress = Address.parseRaw(result.account.address).toString();
					} catch (error) {
						console.error('Error occured when connecting to wallet', error);

						throw error;
					}
				}
				if (!values.media) throw new Error('No media');

				const { collectionAddress } = await createEdition(
					tonClient,
					tonConnectUI,
					{
						name: values.name,
						description: values.description,
						image: values.media,
						symbol: values.symbol,
						price: values.price,
						royalty: values.royalty,
						payoutAddress: values.payoutAddress,
						creatorAddress,
						maxSupply:
							values.editionSize.type === EDITIONS_SIZES.FIXED ? values.editionSize.amount : '0',
						dateStart: values.validity.start ? dateToUnix(values.validity.start) : 0,
						dateEnd: values.validity.end ? dateToUnix(values.validity.end) : 0,
					},
					turnOffSubmition
				);

				sendEditionUrlToTelegram(collectionAddress, values.name);

				setDeploymentState({
					isModalOpened: true,
					address: collectionAddress,
					editionName: values.name,
				});
			} catch (error) {
				console.error(error);
			} finally {
				turnOffSubmition();
			}
		},
		[sendEditionUrlToTelegram, address, tonConnectUI.connected, tonClient]
	);

	const handleDeploymentModalClose = useCallback(() => {
		setDeploymentState(initialDeploymentState);
	}, []);

	let createEditionInitialValues: FormValues;

	if (!isTestnet()) {
		createEditionInitialValues = {
			name: '',
			symbol: '',
			description: '',
			media: null,
			price: '',
			editionSize: {
				type: EDITIONS_SIZES.OPEN_EDITION,
				amount: '',
			},
			royalty: '',
			validity: {
				start: null,
				end: null,
			},
			payoutAddress: address,
		};
	} else {
		createEditionInitialValues = getTestnetInitialValues(address);
	}

	return (
		<Formik
			initialValues={createEditionInitialValues}
			validationSchema={formSchema}
			enableReinitialize={false}
			onSubmit={handleSubmit}
		>
			<section className={styles.createEditionContainer}>
				<Preview />
				<FormArea
					address={address}
					handleDeploymentModalClose={handleDeploymentModalClose}
					deploymentState={getdeploymentState()}
					isWalletConnected={tonConnectUI.connected}
					handleConnectWalletClick={handleConnectWalletClick}
				/>
			</section>
		</Formik>
	);
}

export default CreateEditionForm;

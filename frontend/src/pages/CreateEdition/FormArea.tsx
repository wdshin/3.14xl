import { useEffect, useState, useCallback } from 'react';
import { Form, useFormikContext } from 'formik';
import { ChangeLocationDialog } from '@/components/ChangeLocationDialog';
import { DeploymentModal } from '@/pages/CreateEdition/DeploymentModal';

import styles from '@/pages/CreateEdition/styles.module.scss';

import { Button, ButtonKinds, MediaInput, TextArea, Input } from '@/components';
import { FormValues } from '@/pages/CreateEdition/interfaces';
import EditionSize from '@/pages/CreateEdition/EditionSize';
import ValidityPeriod from '@/pages/CreateEdition/ValidityPeriod';

type Props = {
	address: string;
	isWalletConnected: boolean;
	deploymentState: { isModalOpened: boolean; address: string; editionName: string };
	handleConnectWalletClick: () => void;
	handleDeploymentModalClose: () => void;
};

function FormArea({
	isWalletConnected,
	handleDeploymentModalClose,
	handleConnectWalletClick,
	deploymentState,
	address,
}: Props) {
	const { isValid, dirty, values, touched, setFieldValue, isSubmitting, submitForm, resetForm } =
		useFormikContext<FormValues>();

	const isFormValid = isValid && dirty;

	const createNewEditionHandler = useCallback(() => {
		handleDeploymentModalClose();
		resetForm();
	}, [resetForm, handleDeploymentModalClose]);

	useEffect(() => {
		if (isWalletConnected && !values.payoutAddress) {
			setFieldValue('payoutAddress', address);
		}
	}, [address, isWalletConnected, values.payoutAddress]);

	useEffect(() => {
		if ((touched.symbol && values.symbol) || isSubmitting) {
			return;
		}
		if (values.name) {
			setFieldValue('symbol', `$${values.name.toUpperCase()}`);
		}
	}, [values.name, touched.symbol, isSubmitting]);

	return (
		<Form className={styles.createEdition}>
			{deploymentState.isModalOpened && (
				<DeploymentModal
					deploy={submitForm}
					editionName={deploymentState.editionName}
					address={deploymentState.address}
					createNewEditionHandler={createNewEditionHandler}
					onClose={handleDeploymentModalClose}
				/>
			)}
			<div className={styles.createEditionActionTitleWrapper}>
				<div className={styles.createEditionActionTitle}>Collection details</div>
				<Button
					componentType="button"
					kind={ButtonKinds.basic}
					basicInverted
					mini
					buttonType="reset"
				>
					Clear fields
				</Button>
			</div>
			<Input label={'Name'} name="name" placeholder="The Project" max={30} type="text" />
			<Input label={'Symbol'} name="symbol" type="text" max={15} placeholder="$SYMBOL" />
			<TextArea
				label={'Description'}
				placeholder={"I'd like to share my project. It's about..."}
				name={'description'}
				maxLength={260}
			/>
			<MediaInput label={'Media'} name="media" placeholder="None selected" />
			<Input label={'Price'} name="price" type="text" placeholder="0.01" units="TON" max={8} />
			<EditionSize />
			<ValidityPeriod />
			<Input label={'Royalty'} name="royalty" type="text" placeholder="5" units="%" max={8} />
			<Input
				subCaption={`Enter the address where you want to receive withdrawals and royalties. ${
					!isWalletConnected
						? 'You can enter the payout address manually or connect your wallet.'
						: ''
				}`}
				label={'Payout address'}
				name="payoutAddress"
				type="text"
				placeholder="Address"
				inputSupplementaryComponent={
					!isWalletConnected ? (
						<Button
							componentType="button"
							kind={ButtonKinds.basic}
							onClick={handleConnectWalletClick}
							basicInverted
							mini
							buttonType="button"
						>
							Connect wallet
						</Button>
					) : null
				}
			/>
			<div className={styles.createEditionSubmitButton}>
				<Button
					componentType="button"
					buttonType="submit"
					disabled={!isFormValid}
					expanded
					isSubmitting={isSubmitting}
					kind={ButtonKinds.basic}
				>
					Create edition
				</Button>
			</div>
		</Form>
	);
}

export default FormArea;

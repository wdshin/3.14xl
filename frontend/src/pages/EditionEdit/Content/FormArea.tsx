import { Form, useFormikContext } from 'formik';
import styles from './../styles.module.scss';

import { Button, ButtonKinds, MediaInput, TextArea, Input } from '@/components';
import { FormValues } from '@/pages/CreateEdition/interfaces';
import ValidityPeriod from '@/pages/CreateEdition/ValidityPeriod';
import { DeploymentModal } from '@/pages/EditionEdit/Content/DeploymentEditModal';
import { useCallback, useContext } from 'react';
import { DeploymentContext } from '@/pages/EditionEdit/deploymentContext';
import { useLocation, useNavigate } from 'react-router-dom';

function FormArea() {
	const { dirty, submitForm, values, isSubmitting } = useFormikContext<FormValues>();
	const { contentDeploymentState, setContentDeploymentState, editionName } =
		useContext(DeploymentContext);

	let location = useLocation();
	const navigate = useNavigate();


	const hanelCancelClick = useCallback(() => {
		const editionSourcePathname = location.pathname.substring(0, location.pathname.length - 4); // Remove edit word
		navigate(editionSourcePathname)
	}, [isSubmitting, location.pathname]);

	return (
		<Form className={styles.editEditionForm}>
			{contentDeploymentState.isModalOpened && (
				<DeploymentModal
					values={values}
					deploy={submitForm}
					editionName={editionName}
					address={contentDeploymentState.address}
				/>
			)}
			<div className={styles.editEditionFormTitle}>
				<h1>Edit</h1>
			</div>
			<TextArea
				label={'Description'}
				placeholder={"I'd like to share my project. It's about..."}
				name={'description'}
				maxLength={260}
			/>
			<MediaInput label={'Media'} name="media" placeholder="None selected" />
			<Input label={'Price'} name="price" type="text" placeholder="0.01" units="TON" max={8} />
			<ValidityPeriod />
			<Input label={'Payout address'} name="payoutAddress" type="text" placeholder="Address" />
			<div className={styles.editEditionFormButtons}>
				<Button
					componentType="button"
					buttonType="reset"
					expanded
					isSubmitting={isSubmitting}
					onClick={hanelCancelClick}
					kind={ButtonKinds.basic}
					basicInverted
				>
					Cancel
				</Button>
				<Button
					componentType="button"
					buttonType="submit"
					isSubmitting={isSubmitting}
					disabled={!dirty}
					expanded
					kind={ButtonKinds.basic}
				>
					Save
				</Button>
			</div>
		</Form>
	);
}

export default FormArea;

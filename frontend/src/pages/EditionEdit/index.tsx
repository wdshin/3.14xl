import { useCallback, useState, Context, Provider, useMemo } from 'react';
import { useAsync, useGetSetState } from 'react-use';
import { Address } from 'ton-core';
import { useTonClient } from '@/hooks/useTonClient';
import { NftCollection, NftManager } from '@/wrappers';
import { CollectionContent } from '@/wrappers/types';
import { useParams } from 'react-router';
import { useMediaQuery } from 'react-responsive';
import { Helmet } from 'react-helmet-async';
import { PageLoader } from '@/components';
import { initialDeploymentState } from '@/pages/EditionEdit/constants';
import { DeploymentContext } from '@/pages/EditionEdit/deploymentContext';
import { Content } from '@/pages/EditionEdit/Content';
// Hotfix for https://github.com/yocontra/react-responsive/issues/306, remove when resolved
console.log(useMediaQuery);

function EditionEdit() {
	const { collectionAddress } = useParams();
	const [editionName, setName] = useState<string>('');
	const [getContentDeploymentState, setContentDeploymentState] =
		useGetSetState(initialDeploymentState);
	const [getOwnerDeploymentState, setOwnerDeploymentState] = useGetSetState(initialDeploymentState);

	const setEditionName = useCallback(
		(name: string) => {
			setName(name);
		},
		[setName]
	);

	const tonClient = useTonClient();

	const collectionDataAsync = useAsync(async () => {
		if (!collectionAddress || !tonClient) {
			return null;
		}

		const nftCollection = NftCollection.createFromAddress(Address.parse(collectionAddress));
		const nftColelctionContract = tonClient.open(nftCollection);
		let collectionData = await nftColelctionContract.getCollectionData();
		const content: CollectionContent = await fetch(collectionData.collectionContentUri).then(res =>
			res.json()
		);

		setEditionName(content.name);

		const nftManager = NftManager.createFromAddress(collectionData.ownerAddress);
		const nftManagerContract = tonClient.open(nftManager);
		const managerData = await nftManagerContract.getManagerData();

		return { collectionData, content, managerAddress: managerData.owner };
	}, [tonClient, collectionAddress]);

	const contentDeploymentState = getContentDeploymentState();
	const ownerDeploymentState = getOwnerDeploymentState();

	const ContextProviderValue = useMemo(
		() => ({
			editionName,
			setEditionName,
			ownerDeploymentState,
			contentDeploymentState,
			setContentDeploymentState,
			setOwnerDeploymentState,
		}),
		[
			editionName,
			setEditionName,
			ownerDeploymentState,
			contentDeploymentState,
			setContentDeploymentState,
			setOwnerDeploymentState,
		]
	);

	if (collectionDataAsync.error && !collectionDataAsync.value) {
		return <div>Something went wrong</div>;
	}

	if (collectionDataAsync.loading || !collectionDataAsync.value) {
		return <PageLoader />;
	}

	return (
		<DeploymentContext.Provider value={ContextProviderValue}>
			<Helmet title={'3.14XL - Edit edition'} />
			<Content editionData={collectionDataAsync.value} />
		</DeploymentContext.Provider>
	);
}

export default EditionEdit;

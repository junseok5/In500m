import * as React from "react"
import useCouponDetailModal from "src/hooks/modal/useCouponDetailModal"
import useAdvertisementInModal from "src/hooks/modal/useAdvertisementInModal"
import Modal from "src/components/boxes/Modal"
import SubTitle from "src/components/elements/SubTitle"
import Text from "src/components/elements/Text"
import Image from "src/components/elements/Image"
import Button from "src/components/elements/Button"
// @ts-ignore
import Barcode from "react-barcode"
// @ts-ignore
import domtoimage from "dom-to-image"
import { storageURL } from 'src/constants'

interface CouponDetailModalProps {}

const CouponDetailModal: React.SFC<CouponDetailModalProps> = () => {
    const {
        couponDetailModalVisible,
        onHideCouponDetailModal
    } = useCouponDetailModal()
    const { advertisementInModal: ad } = useAdvertisementInModal()

    const onClickDownloadButton = React.useCallback(() => {
        const modalDom = document.getElementById("modal")
        domtoimage
            .toSvg(modalDom, {
                filter: (node: HTMLElement) => node.tagName !== "i"
            })
            .then((dataUrl: string) => {
                console.log(dataUrl)
            })
    }, [])

    return (
        <Modal
            title={ad.title}
            show={couponDetailModalVisible}
            onHideModal={onHideCouponDetailModal}
        >
            <Image
                src={`${storageURL}/ads${ad.photo}`}
                width={"292px"}
                height={"auto"}
            />
            <Barcode value={ad.couponNum} width={2.4} height={80} />
            <Text>{ad.description}</Text>
            <SubTitle noHorizontalMargin={true}>
                {ad.startAt} ~ {ad.endAt}
            </SubTitle>
            <Button title={"다운받기"} onClick={onClickDownloadButton} />
        </Modal>
    )
}

export default CouponDetailModal

import * as React from "react"
import { useCallback, useEffect } from "react"
import useBizRegModal from "src/hooks/modal/useBizRegModal"
import Modal from "src/components/boxes/Modal"
import FileInput from "src/containers/elements/FileInput"
import useInputFile from "src/hooks/elements/useInputFile"
import Button from "src/components/elements/Button"
import useAddBizRegImg from "src/hooks/store/useAddBizRegImg"
import useLoadStore from "src/hooks/store/useLoadStore"
import useOwnerInfo from "src/hooks/owners/useOwnerInfo"
import ErrorText from "src/components/elements/ErrorText"
import { useParams } from "react-router-dom"

interface BizRegModalProps {}

const BizRegModal: React.SFC<BizRegModalProps> = () => {
    const { bizRegModalVisible, onHideBizRegModal } = useBizRegModal()
    const { file: bizRegImg, onChange: changeBizRegImg } = useInputFile()
    const {
        isAddingBizRegImg,
        addedBizRegImg,
        addBizRegImgErrorMessage,
        addBizRegImg
    } = useAddBizRegImg()
    const { storeId } = useParams()
    const { store } = useLoadStore()
    const { token } = useOwnerInfo()
    const { loadStore } = useLoadStore()

    useEffect(() => {
        if (addedBizRegImg) {
            alert("사업자 인증서 제출에 성공하였습니다.")
            onHideBizRegModal()
            if (storeId) {
                loadStore({ id: storeId, token })
            }
        }
    }, [addedBizRegImg])

    const submitBizRegImg = useCallback(() => {
        if (!bizRegImg) {
            alert("사업자 인증서 사진을 넣어주세요.")
            return
        } else if (!store) {
            alert("오류가 발생했습니다. 다시 한번 시도해주세요.")
            return
        }

        const formData = new FormData()
        formData.append("bizRegImg", bizRegImg)

        if (storeId) {
            addBizRegImg({ storeId, formData, token })
        }
    }, [bizRegImg])

    const onClickUploadButton = useCallback(
        event => {
            event.preventDefault()
            event.stopPropagation()

            submitBizRegImg()
        },
        [bizRegImg]
    )

    return (
        <Modal
            title={"사업자 인증서 등록"}
            show={bizRegModalVisible}
            onHideModal={onHideBizRegModal}
        >
            <FileInput
                width={"100%"}
                height={"320px"}
                buttonTitle={"인증서 사진 업로드"}
                file={bizRegImg}
                onChange={changeBizRegImg}
            />
            <ErrorText>{addBizRegImgErrorMessage}</ErrorText>
            <Button
                title={"인증 요청하기"}
                loading={isAddingBizRegImg}
                onClick={onClickUploadButton}
            />
        </Modal>
    )
}

export default BizRegModal

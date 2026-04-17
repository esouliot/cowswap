import { useEffect } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { usePostHooksRecipientOverride } from 'entities/orderHooks/usePostHooksRecipientOverride'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useIsNativeIn } from './useIsNativeInOrOut'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

export function useResetRecipient(onChangeRecipient: (recipient: string | null) => void): null {
  const isAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible()
  const tradeState = useDerivedTradeState()
  const tradeStateFromUrl = useTradeStateFromUrl()
  const postHooksRecipientOverride = usePostHooksRecipientOverride()
  const isHooksTradeType = useIsHooksTradeType()
  const isNativeIn = useIsNativeIn()
  const hasTradeState = !!tradeStateFromUrl
  const { chainId } = useWalletInfo()

  const prevPostHooksRecipientOverride = usePrevious(postHooksRecipientOverride)
  const recipient = tradeState?.recipient
  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient

  /**
   * Reset recipient value only once at App start if it's not set in URL
   */
  useEffect(() => {
    if (!hasRecipientInUrl && !isAlternativeOrderModalVisible && !postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTradeState])

  /**
   * Reset recipient whenever chainId changes
   */

  const prevChainId = usePrevious(chainId)
  useEffect(() => {
    if (prevChainId === undefined || prevChainId === chainId) return
    if (!postHooksRecipientOverride) {
      onChangeRecipient(null)
    }
  }, [chainId, prevChainId, onChangeRecipient, postHooksRecipientOverride])

  /**
   * Remove recipient override when its source hook was deleted
   */
  useEffect(() => {
    const recipientOverrideWasRemoved =
      prevPostHooksRecipientOverride != null &&
      !postHooksRecipientOverride &&
      recipient === prevPostHooksRecipientOverride

    if (recipientOverrideWasRemoved) {
      onChangeRecipient(null)
    }
  }, [recipient, postHooksRecipientOverride, prevPostHooksRecipientOverride, isNativeIn, onChangeRecipient])

  /**
   * Remove recipient when going out from hooks-store page
   */
  const prevIsHooksTradeType = usePrevious(isHooksTradeType)

  useEffect(() => {
    if (prevIsHooksTradeType === undefined || prevIsHooksTradeType === isHooksTradeType) return
    if (!isHooksTradeType) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, prevIsHooksTradeType, onChangeRecipient])

  useEffect(() => {
    if (isHooksTradeType && isNativeIn) {
      onChangeRecipient(null)
    }
  }, [isHooksTradeType, isNativeIn, onChangeRecipient])

  return null
}

import type {Result} from './support'

export interface Market {
  creator: Uint8Array
  creation: MarketCreation
  creatorFee: number
  oracle: Uint8Array
  metadata: Uint8Array
  marketType: MarketType
  period: MarketPeriod
  scoringRule: ScoringRule
  status: MarketStatus
  report: (Report | undefined)
  resolvedOutcome: (Outcome | undefined)
  mdm: MarketDisputeMechanism
}

export type MarketCreation = MarketCreation_Permissionless | MarketCreation_Advised

export interface MarketCreation_Permissionless {
  __kind: 'Permissionless'
}

export interface MarketCreation_Advised {
  __kind: 'Advised'
}

export type MarketType = MarketType_Categorical | MarketType_Scalar

export interface MarketType_Categorical {
  __kind: 'Categorical'
  value: number
}

export interface MarketType_Scalar {
  __kind: 'Scalar'
  value: [bigint, bigint]
}

export type MarketPeriod = MarketPeriod_Block | MarketPeriod_Timestamp

export interface MarketPeriod_Block {
  __kind: 'Block'
  value: [bigint, bigint]
}

export interface MarketPeriod_Timestamp {
  __kind: 'Timestamp'
  value: [bigint, bigint]
}

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
  __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
  __kind: 'RikiddoSigmoidFeeMarketEma'
}

export type MarketStatus = MarketStatus_Proposed | MarketStatus_Active | MarketStatus_Suspended | MarketStatus_Closed | MarketStatus_CollectingSubsidy | MarketStatus_InsufficientSubsidy | MarketStatus_Reported | MarketStatus_Disputed | MarketStatus_Resolved

export interface MarketStatus_Proposed {
  __kind: 'Proposed'
}

export interface MarketStatus_Active {
  __kind: 'Active'
}

export interface MarketStatus_Suspended {
  __kind: 'Suspended'
}

export interface MarketStatus_Closed {
  __kind: 'Closed'
}

export interface MarketStatus_CollectingSubsidy {
  __kind: 'CollectingSubsidy'
}

export interface MarketStatus_InsufficientSubsidy {
  __kind: 'InsufficientSubsidy'
}

export interface MarketStatus_Reported {
  __kind: 'Reported'
}

export interface MarketStatus_Disputed {
  __kind: 'Disputed'
}

export interface MarketStatus_Resolved {
  __kind: 'Resolved'
}

export interface Report {
  at: bigint
  by: Uint8Array
  outcome: OutcomeReport
}

export type Outcome = Outcome_Complete | Outcome_Incomplete | Outcome_Error

export interface Outcome_Complete {
  __kind: 'Complete'
  value: bigint
}

export interface Outcome_Incomplete {
  __kind: 'Incomplete'
  value: [bigint, XcmErrorV0]
}

export interface Outcome_Error {
  __kind: 'Error'
  value: XcmErrorV0
}

export type MarketDisputeMechanism = MarketDisputeMechanism_Authorized | MarketDisputeMechanism_Court | MarketDisputeMechanism_SimpleDisputes

export interface MarketDisputeMechanism_Authorized {
  __kind: 'Authorized'
  value: Uint8Array
}

export interface MarketDisputeMechanism_Court {
  __kind: 'Court'
}

export interface MarketDisputeMechanism_SimpleDisputes {
  __kind: 'SimpleDisputes'
}

export type OutcomeReport = OutcomeReport_Categorical | OutcomeReport_Scalar

export interface OutcomeReport_Categorical {
  __kind: 'Categorical'
  value: number
}

export interface OutcomeReport_Scalar {
  __kind: 'Scalar'
  value: bigint
}

export type XcmErrorV0 = XcmErrorV0_Undefined | XcmErrorV0_Overflow | XcmErrorV0_Unimplemented | XcmErrorV0_UnhandledXcmVersion | XcmErrorV0_UnhandledXcmMessage | XcmErrorV0_UnhandledEffect | XcmErrorV0_EscalationOfPrivilege | XcmErrorV0_UntrustedReserveLocation | XcmErrorV0_UntrustedTeleportLocation | XcmErrorV0_DestinationBufferOverflow | XcmErrorV0_SendFailed | XcmErrorV0_CannotReachDestination | XcmErrorV0_MultiLocationFull | XcmErrorV0_FailedToDecode | XcmErrorV0_BadOrigin | XcmErrorV0_ExceedsMaxMessageSize | XcmErrorV0_FailedToTransactAsset | XcmErrorV0_WeightLimitReached | XcmErrorV0_Wildcard | XcmErrorV0_TooMuchWeightRequired | XcmErrorV0_NotHoldingFees | XcmErrorV0_WeightNotComputable | XcmErrorV0_Barrier | XcmErrorV0_NotWithdrawable | XcmErrorV0_LocationCannotHold | XcmErrorV0_TooExpensive | XcmErrorV0_AssetNotFound | XcmErrorV0_RecursionLimitReached

export interface XcmErrorV0_Undefined {
  __kind: 'Undefined'
  value: null
}

export interface XcmErrorV0_Overflow {
  __kind: 'Overflow'
  value: null
}

export interface XcmErrorV0_Unimplemented {
  __kind: 'Unimplemented'
  value: null
}

export interface XcmErrorV0_UnhandledXcmVersion {
  __kind: 'UnhandledXcmVersion'
  value: null
}

export interface XcmErrorV0_UnhandledXcmMessage {
  __kind: 'UnhandledXcmMessage'
  value: null
}

export interface XcmErrorV0_UnhandledEffect {
  __kind: 'UnhandledEffect'
  value: null
}

export interface XcmErrorV0_EscalationOfPrivilege {
  __kind: 'EscalationOfPrivilege'
  value: null
}

export interface XcmErrorV0_UntrustedReserveLocation {
  __kind: 'UntrustedReserveLocation'
  value: null
}

export interface XcmErrorV0_UntrustedTeleportLocation {
  __kind: 'UntrustedTeleportLocation'
  value: null
}

export interface XcmErrorV0_DestinationBufferOverflow {
  __kind: 'DestinationBufferOverflow'
  value: null
}

export interface XcmErrorV0_SendFailed {
  __kind: 'SendFailed'
  value: null
}

export interface XcmErrorV0_CannotReachDestination {
  __kind: 'CannotReachDestination'
  value: [MultiLocation, InstructionV2[]]
}

export interface XcmErrorV0_MultiLocationFull {
  __kind: 'MultiLocationFull'
  value: null
}

export interface XcmErrorV0_FailedToDecode {
  __kind: 'FailedToDecode'
  value: null
}

export interface XcmErrorV0_BadOrigin {
  __kind: 'BadOrigin'
  value: null
}

export interface XcmErrorV0_ExceedsMaxMessageSize {
  __kind: 'ExceedsMaxMessageSize'
  value: null
}

export interface XcmErrorV0_FailedToTransactAsset {
  __kind: 'FailedToTransactAsset'
  value: null
}

export interface XcmErrorV0_WeightLimitReached {
  __kind: 'WeightLimitReached'
  value: bigint
}

export interface XcmErrorV0_Wildcard {
  __kind: 'Wildcard'
  value: null
}

export interface XcmErrorV0_TooMuchWeightRequired {
  __kind: 'TooMuchWeightRequired'
  value: null
}

export interface XcmErrorV0_NotHoldingFees {
  __kind: 'NotHoldingFees'
  value: null
}

export interface XcmErrorV0_WeightNotComputable {
  __kind: 'WeightNotComputable'
  value: null
}

export interface XcmErrorV0_Barrier {
  __kind: 'Barrier'
  value: null
}

export interface XcmErrorV0_NotWithdrawable {
  __kind: 'NotWithdrawable'
  value: null
}

export interface XcmErrorV0_LocationCannotHold {
  __kind: 'LocationCannotHold'
  value: null
}

export interface XcmErrorV0_TooExpensive {
  __kind: 'TooExpensive'
  value: null
}

export interface XcmErrorV0_AssetNotFound {
  __kind: 'AssetNotFound'
  value: null
}

export interface XcmErrorV0_RecursionLimitReached {
  __kind: 'RecursionLimitReached'
  value: null
}

export interface MultiLocation {
  parents: number
  interior: JunctionsV1
}

export type InstructionV2 = InstructionV2_WithdrawAsset | InstructionV2_ReserveAssetDeposited | InstructionV2_ReceiveTeleportedAsset | InstructionV2_QueryResponse | InstructionV2_TransferAsset | InstructionV2_TransferReserveAsset | InstructionV2_Transact | InstructionV2_HrmpNewChannelOpenRequest | InstructionV2_HrmpChannelAccepted | InstructionV2_HrmpChannelClosing | InstructionV2_ClearOrigin | InstructionV2_DescendOrigin | InstructionV2_ReportError | InstructionV2_DepositAsset | InstructionV2_DepositReserveAsset | InstructionV2_ExchangeAsset | InstructionV2_InitiateReserveWithdraw | InstructionV2_InitiateTeleport | InstructionV2_QueryHolding | InstructionV2_BuyExecution | InstructionV2_RefundSurplus | InstructionV2_SetErrorHandler | InstructionV2_SetAppendix | InstructionV2_ClearError | InstructionV2_ClaimAsset | InstructionV2_Trap

export interface InstructionV2_WithdrawAsset {
  __kind: 'WithdrawAsset'
  value: MultiAssetV1[]
}

export interface InstructionV2_ReserveAssetDeposited {
  __kind: 'ReserveAssetDeposited'
  value: MultiAssetV1[]
}

export interface InstructionV2_ReceiveTeleportedAsset {
  __kind: 'ReceiveTeleportedAsset'
  value: MultiAssetV1[]
}

export interface InstructionV2_QueryResponse {
  __kind: 'QueryResponse'
  queryId: bigint
  response: ResponseV2
  maxWeight: bigint
}

export interface InstructionV2_TransferAsset {
  __kind: 'TransferAsset'
  assets: MultiAssetV1[]
  beneficiary: MultiLocationV2
}

export interface InstructionV2_TransferReserveAsset {
  __kind: 'TransferReserveAsset'
  assets: MultiAssetV1[]
  dest: MultiLocationV2
  xcm: InstructionV2[]
}

export interface InstructionV2_Transact {
  __kind: 'Transact'
  originType: OriginKindV2
  requireWeightAtMost: bigint
  call: DoubleEncodedCall
}

export interface InstructionV2_HrmpNewChannelOpenRequest {
  __kind: 'HrmpNewChannelOpenRequest'
  sender: number
  maxMessageSize: number
  maxCapacity: number
}

export interface InstructionV2_HrmpChannelAccepted {
  __kind: 'HrmpChannelAccepted'
  recipient: number
}

export interface InstructionV2_HrmpChannelClosing {
  __kind: 'HrmpChannelClosing'
  initiator: number
  sender: number
  recipient: number
}

export interface InstructionV2_ClearOrigin {
  __kind: 'ClearOrigin'
  value: null
}

export interface InstructionV2_DescendOrigin {
  __kind: 'DescendOrigin'
  value: InteriorMultiLocation
}

export interface InstructionV2_ReportError {
  __kind: 'ReportError'
  queryId: bigint
  dest: MultiLocationV2
  maxResponseWeight: bigint
}

export interface InstructionV2_DepositAsset {
  __kind: 'DepositAsset'
  assets: MultiAssetFilterV2
  maxAssets: number
  beneficiary: MultiLocationV2
}

export interface InstructionV2_DepositReserveAsset {
  __kind: 'DepositReserveAsset'
  assets: MultiAssetFilterV2
  maxAssets: number
  dest: MultiLocationV2
  xcm: InstructionV2[]
}

export interface InstructionV2_ExchangeAsset {
  __kind: 'ExchangeAsset'
  give: MultiAssetFilterV2
  receive: MultiAssetV1[]
}

export interface InstructionV2_InitiateReserveWithdraw {
  __kind: 'InitiateReserveWithdraw'
  assets: MultiAssetFilterV2
  reserve: MultiLocationV2
  xcm: InstructionV2[]
}

export interface InstructionV2_InitiateTeleport {
  __kind: 'InitiateTeleport'
  assets: MultiAssetFilterV2
  dest: MultiLocationV2
  xcm: InstructionV2[]
}

export interface InstructionV2_QueryHolding {
  __kind: 'QueryHolding'
  queryId: bigint
  dest: MultiLocationV2
  assets: MultiAssetFilterV2
  maxResponseWeight: bigint
}

export interface InstructionV2_BuyExecution {
  __kind: 'BuyExecution'
  fees: MultiAssetV2
  weightLimit: WeightLimitV2
}

export interface InstructionV2_RefundSurplus {
  __kind: 'RefundSurplus'
  value: null
}

export interface InstructionV2_SetErrorHandler {
  __kind: 'SetErrorHandler'
  value: InstructionV2[]
}

export interface InstructionV2_SetAppendix {
  __kind: 'SetAppendix'
  value: InstructionV2[]
}

export interface InstructionV2_ClearError {
  __kind: 'ClearError'
  value: null
}

export interface InstructionV2_ClaimAsset {
  __kind: 'ClaimAsset'
  assets: MultiAssetV1[]
  ticket: MultiLocationV2
}

export interface InstructionV2_Trap {
  __kind: 'Trap'
  value: bigint
}

export type JunctionsV1 = JunctionsV1_Here | JunctionsV1_X1 | JunctionsV1_X2 | JunctionsV1_X3 | JunctionsV1_X4 | JunctionsV1_X5 | JunctionsV1_X6 | JunctionsV1_X7 | JunctionsV1_X8

export interface JunctionsV1_Here {
  __kind: 'Here'
  value: null
}

export interface JunctionsV1_X1 {
  __kind: 'X1'
  value: JunctionV1
}

export interface JunctionsV1_X2 {
  __kind: 'X2'
  value: [JunctionV1, JunctionV1]
}

export interface JunctionsV1_X3 {
  __kind: 'X3'
  value: [JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X4 {
  __kind: 'X4'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X5 {
  __kind: 'X5'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X6 {
  __kind: 'X6'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X7 {
  __kind: 'X7'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X8 {
  __kind: 'X8'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface MultiAssetV1 {
  id: XcmAssetId
  fungibility: FungibilityV1
}

export type ResponseV2 = ResponseV2_Null | ResponseV2_Assets | ResponseV2_ExecutionResult

export interface ResponseV2_Null {
  __kind: 'Null'
  value: null
}

export interface ResponseV2_Assets {
  __kind: 'Assets'
  value: MultiAssetV1[]
}

export interface ResponseV2_ExecutionResult {
  __kind: 'ExecutionResult'
  value: Result<null, [number, XcmErrorV2]>
}

export interface MultiLocationV2 {
  parents: number
  interior: JunctionsV1
}

export type OriginKindV2 = OriginKindV2_Native | OriginKindV2_SovereignAccount | OriginKindV2_Superuser | OriginKindV2_Xcm

export interface OriginKindV2_Native {
  __kind: 'Native'
}

export interface OriginKindV2_SovereignAccount {
  __kind: 'SovereignAccount'
}

export interface OriginKindV2_Superuser {
  __kind: 'Superuser'
}

export interface OriginKindV2_Xcm {
  __kind: 'Xcm'
}

export interface DoubleEncodedCall {
  encoded: Uint8Array
}

export type InteriorMultiLocation = InteriorMultiLocation_Here | InteriorMultiLocation_X1 | InteriorMultiLocation_X2 | InteriorMultiLocation_X3 | InteriorMultiLocation_X4 | InteriorMultiLocation_X5 | InteriorMultiLocation_X6 | InteriorMultiLocation_X7 | InteriorMultiLocation_X8

export interface InteriorMultiLocation_Here {
  __kind: 'Here'
  value: null
}

export interface InteriorMultiLocation_X1 {
  __kind: 'X1'
  value: JunctionV1
}

export interface InteriorMultiLocation_X2 {
  __kind: 'X2'
  value: [JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X3 {
  __kind: 'X3'
  value: [JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X4 {
  __kind: 'X4'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X5 {
  __kind: 'X5'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X6 {
  __kind: 'X6'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X7 {
  __kind: 'X7'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X8 {
  __kind: 'X8'
  value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export type MultiAssetFilterV2 = MultiAssetFilterV2_Definite | MultiAssetFilterV2_Wild

export interface MultiAssetFilterV2_Definite {
  __kind: 'Definite'
  value: MultiAssetV1[]
}

export interface MultiAssetFilterV2_Wild {
  __kind: 'Wild'
  value: WildMultiAssetV1
}

export interface MultiAssetV2 {
  id: XcmAssetId
  fungibility: FungibilityV1
}

export type WeightLimitV2 = WeightLimitV2_Unlimited | WeightLimitV2_Limited

export interface WeightLimitV2_Unlimited {
  __kind: 'Unlimited'
  value: null
}

export interface WeightLimitV2_Limited {
  __kind: 'Limited'
  value: bigint
}

export type JunctionV1 = JunctionV1_Parachain | JunctionV1_AccountId32 | JunctionV1_AccountIndex64 | JunctionV1_AccountKey20 | JunctionV1_PalletInstance | JunctionV1_GeneralIndex | JunctionV1_GeneralKey | JunctionV1_OnlyChild | JunctionV1_Plurality

export interface JunctionV1_Parachain {
  __kind: 'Parachain'
  value: number
}

export interface JunctionV1_AccountId32 {
  __kind: 'AccountId32'
  network: NetworkId
  id: Uint8Array
}

export interface JunctionV1_AccountIndex64 {
  __kind: 'AccountIndex64'
  network: NetworkId
  index: bigint
}

export interface JunctionV1_AccountKey20 {
  __kind: 'AccountKey20'
  network: NetworkId
  key: Uint8Array
}

export interface JunctionV1_PalletInstance {
  __kind: 'PalletInstance'
  value: number
}

export interface JunctionV1_GeneralIndex {
  __kind: 'GeneralIndex'
  value: bigint
}

export interface JunctionV1_GeneralKey {
  __kind: 'GeneralKey'
  value: Uint8Array
}

export interface JunctionV1_OnlyChild {
  __kind: 'OnlyChild'
  value: null
}

export interface JunctionV1_Plurality {
  __kind: 'Plurality'
  id: BodyId
  part: BodyPart
}

export type XcmAssetId = XcmAssetId_Concrete | XcmAssetId_Abstract

export interface XcmAssetId_Concrete {
  __kind: 'Concrete'
  value: MultiLocation
}

export interface XcmAssetId_Abstract {
  __kind: 'Abstract'
  value: Uint8Array
}

export type FungibilityV1 = FungibilityV1_Fungible | FungibilityV1_NonFungible

export interface FungibilityV1_Fungible {
  __kind: 'Fungible'
  value: bigint
}

export interface FungibilityV1_NonFungible {
  __kind: 'NonFungible'
  value: AssetInstanceV1
}

export type XcmErrorV2 = XcmErrorV2_Undefined | XcmErrorV2_Overflow | XcmErrorV2_Unimplemented | XcmErrorV2_UnhandledXcmVersion | XcmErrorV2_UnhandledXcmMessage | XcmErrorV2_UnhandledEffect | XcmErrorV2_EscalationOfPrivilege | XcmErrorV2_UntrustedReserveLocation | XcmErrorV2_UntrustedTeleportLocation | XcmErrorV2_DestinationBufferOverflow | XcmErrorV2_MultiLocationFull | XcmErrorV2_MultiLocationNotInvertible | XcmErrorV2_FailedToDecode | XcmErrorV2_BadOrigin | XcmErrorV2_ExceedsMaxMessageSize | XcmErrorV2_FailedToTransactAsset | XcmErrorV2_WeightLimitReached | XcmErrorV2_Wildcard | XcmErrorV2_TooMuchWeightRequired | XcmErrorV2_NotHoldingFees | XcmErrorV2_WeightNotComputable | XcmErrorV2_Barrier | XcmErrorV2_NotWithdrawable | XcmErrorV2_LocationCannotHold | XcmErrorV2_TooExpensive | XcmErrorV2_AssetNotFound | XcmErrorV2_DestinationUnsupported | XcmErrorV2_RecursionLimitReached | XcmErrorV2_Transport | XcmErrorV2_Unroutable | XcmErrorV2_UnknownWeightRequired | XcmErrorV2_Trap | XcmErrorV2_UnknownClaim | XcmErrorV2_InvalidLocation

export interface XcmErrorV2_Undefined {
  __kind: 'Undefined'
  value: null
}

export interface XcmErrorV2_Overflow {
  __kind: 'Overflow'
  value: null
}

export interface XcmErrorV2_Unimplemented {
  __kind: 'Unimplemented'
  value: null
}

export interface XcmErrorV2_UnhandledXcmVersion {
  __kind: 'UnhandledXcmVersion'
  value: null
}

export interface XcmErrorV2_UnhandledXcmMessage {
  __kind: 'UnhandledXcmMessage'
  value: null
}

export interface XcmErrorV2_UnhandledEffect {
  __kind: 'UnhandledEffect'
  value: null
}

export interface XcmErrorV2_EscalationOfPrivilege {
  __kind: 'EscalationOfPrivilege'
  value: null
}

export interface XcmErrorV2_UntrustedReserveLocation {
  __kind: 'UntrustedReserveLocation'
  value: null
}

export interface XcmErrorV2_UntrustedTeleportLocation {
  __kind: 'UntrustedTeleportLocation'
  value: null
}

export interface XcmErrorV2_DestinationBufferOverflow {
  __kind: 'DestinationBufferOverflow'
  value: null
}

export interface XcmErrorV2_MultiLocationFull {
  __kind: 'MultiLocationFull'
  value: null
}

export interface XcmErrorV2_MultiLocationNotInvertible {
  __kind: 'MultiLocationNotInvertible'
  value: null
}

export interface XcmErrorV2_FailedToDecode {
  __kind: 'FailedToDecode'
  value: null
}

export interface XcmErrorV2_BadOrigin {
  __kind: 'BadOrigin'
  value: null
}

export interface XcmErrorV2_ExceedsMaxMessageSize {
  __kind: 'ExceedsMaxMessageSize'
  value: null
}

export interface XcmErrorV2_FailedToTransactAsset {
  __kind: 'FailedToTransactAsset'
  value: null
}

export interface XcmErrorV2_WeightLimitReached {
  __kind: 'WeightLimitReached'
  value: bigint
}

export interface XcmErrorV2_Wildcard {
  __kind: 'Wildcard'
  value: null
}

export interface XcmErrorV2_TooMuchWeightRequired {
  __kind: 'TooMuchWeightRequired'
  value: null
}

export interface XcmErrorV2_NotHoldingFees {
  __kind: 'NotHoldingFees'
  value: null
}

export interface XcmErrorV2_WeightNotComputable {
  __kind: 'WeightNotComputable'
  value: null
}

export interface XcmErrorV2_Barrier {
  __kind: 'Barrier'
  value: null
}

export interface XcmErrorV2_NotWithdrawable {
  __kind: 'NotWithdrawable'
  value: null
}

export interface XcmErrorV2_LocationCannotHold {
  __kind: 'LocationCannotHold'
  value: null
}

export interface XcmErrorV2_TooExpensive {
  __kind: 'TooExpensive'
  value: null
}

export interface XcmErrorV2_AssetNotFound {
  __kind: 'AssetNotFound'
  value: null
}

export interface XcmErrorV2_DestinationUnsupported {
  __kind: 'DestinationUnsupported'
  value: null
}

export interface XcmErrorV2_RecursionLimitReached {
  __kind: 'RecursionLimitReached'
  value: null
}

export interface XcmErrorV2_Transport {
  __kind: 'Transport'
  value: null
}

export interface XcmErrorV2_Unroutable {
  __kind: 'Unroutable'
  value: null
}

export interface XcmErrorV2_UnknownWeightRequired {
  __kind: 'UnknownWeightRequired'
  value: null
}

export interface XcmErrorV2_Trap {
  __kind: 'Trap'
  value: bigint
}

export interface XcmErrorV2_UnknownClaim {
  __kind: 'UnknownClaim'
  value: null
}

export interface XcmErrorV2_InvalidLocation {
  __kind: 'InvalidLocation'
  value: null
}

export type WildMultiAssetV1 = WildMultiAssetV1_All | WildMultiAssetV1_AllOf

export interface WildMultiAssetV1_All {
  __kind: 'All'
  value: null
}

export interface WildMultiAssetV1_AllOf {
  __kind: 'AllOf'
  id: XcmAssetId
  fungibility: WildFungibilityV1
}

export type NetworkId = NetworkId_Any | NetworkId_Named | NetworkId_Polkadot | NetworkId_Kusama

export interface NetworkId_Any {
  __kind: 'Any'
  value: null
}

export interface NetworkId_Named {
  __kind: 'Named'
  value: Uint8Array
}

export interface NetworkId_Polkadot {
  __kind: 'Polkadot'
  value: null
}

export interface NetworkId_Kusama {
  __kind: 'Kusama'
  value: null
}

export type BodyId = BodyId_Unit | BodyId_Named | BodyId_Index | BodyId_Executive | BodyId_Technical | BodyId_Legislative | BodyId_Judicial

export interface BodyId_Unit {
  __kind: 'Unit'
  value: null
}

export interface BodyId_Named {
  __kind: 'Named'
  value: Uint8Array
}

export interface BodyId_Index {
  __kind: 'Index'
  value: number
}

export interface BodyId_Executive {
  __kind: 'Executive'
  value: null
}

export interface BodyId_Technical {
  __kind: 'Technical'
  value: null
}

export interface BodyId_Legislative {
  __kind: 'Legislative'
  value: null
}

export interface BodyId_Judicial {
  __kind: 'Judicial'
  value: null
}

export type BodyPart = BodyPart_Voice | BodyPart_Members | BodyPart_Fraction | BodyPart_AtLeastProportion | BodyPart_MoreThanProportion

export interface BodyPart_Voice {
  __kind: 'Voice'
  value: null
}

export interface BodyPart_Members {
  __kind: 'Members'
  value: number
}

export interface BodyPart_Fraction {
  __kind: 'Fraction'
  nom: number
  denom: number
}

export interface BodyPart_AtLeastProportion {
  __kind: 'AtLeastProportion'
  nom: number
  denom: number
}

export interface BodyPart_MoreThanProportion {
  __kind: 'MoreThanProportion'
  nom: number
  denom: number
}

export type AssetInstanceV1 = AssetInstanceV1_Undefined | AssetInstanceV1_Index | AssetInstanceV1_Array4 | AssetInstanceV1_Array8 | AssetInstanceV1_Array16 | AssetInstanceV1_Array32 | AssetInstanceV1_Blob

export interface AssetInstanceV1_Undefined {
  __kind: 'Undefined'
  value: null
}

export interface AssetInstanceV1_Index {
  __kind: 'Index'
  value: bigint
}

export interface AssetInstanceV1_Array4 {
  __kind: 'Array4'
  value: Uint8Array
}

export interface AssetInstanceV1_Array8 {
  __kind: 'Array8'
  value: Uint8Array
}

export interface AssetInstanceV1_Array16 {
  __kind: 'Array16'
  value: Uint8Array
}

export interface AssetInstanceV1_Array32 {
  __kind: 'Array32'
  value: Uint8Array
}

export interface AssetInstanceV1_Blob {
  __kind: 'Blob'
  value: Uint8Array
}

export type WildFungibilityV1 = WildFungibilityV1_Fungible | WildFungibilityV1_NonFungible

export interface WildFungibilityV1_Fungible {
  __kind: 'Fungible'
}

export interface WildFungibilityV1_NonFungible {
  __kind: 'NonFungible'
}

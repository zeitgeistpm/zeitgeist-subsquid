import {sts, Block, Bytes, Option, Result, EventType, RuntimeCtx} from '../support'
import * as v26 from '../v26'
import * as v32 from '../v32'
import * as v34 from '../v34'
import * as v35 from '../v35'
import * as v36 from '../v36'
import * as v42 from '../v42'
import * as v46 from '../v46'
import * as v56 from '../v56'

export const extrinsicSuccess =  {
    name: 'System.ExtrinsicSuccess',
    /**
     *  An extrinsic completed successfully. \[info\]
     */
    v26: new EventType(
        'System.ExtrinsicSuccess',
        v26.DispatchInfo
    ),
    /**
     * An extrinsic completed successfully.
     */
    v34: new EventType(
        'System.ExtrinsicSuccess',
        sts.struct({
            dispatchInfo: v34.DispatchInfo,
        })
    ),
    /**
     * An extrinsic completed successfully.
     */
    v42: new EventType(
        'System.ExtrinsicSuccess',
        sts.struct({
            dispatchInfo: v42.DispatchInfo,
        })
    ),
    /**
     * An extrinsic completed successfully.
     */
    v46: new EventType(
        'System.ExtrinsicSuccess',
        sts.struct({
            dispatchInfo: v46.DispatchInfo,
        })
    ),
}

export const extrinsicFailed =  {
    name: 'System.ExtrinsicFailed',
    /**
     *  An extrinsic failed. \[error, info\]
     */
    v26: new EventType(
        'System.ExtrinsicFailed',
        sts.tuple([v26.DispatchError, v26.DispatchInfo])
    ),
    /**
     * An extrinsic failed. \[error, info\]
     */
    v32: new EventType(
        'System.ExtrinsicFailed',
        sts.tuple([v32.DispatchError, v32.DispatchInfo])
    ),
    /**
     * An extrinsic failed.
     */
    v34: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v34.DispatchError,
            dispatchInfo: v34.DispatchInfo,
        })
    ),
    /**
     * An extrinsic failed.
     */
    v35: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v35.DispatchError,
            dispatchInfo: v35.DispatchInfo,
        })
    ),
    /**
     * An extrinsic failed.
     */
    v36: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v36.DispatchError,
            dispatchInfo: v36.DispatchInfo,
        })
    ),
    /**
     * An extrinsic failed.
     */
    v42: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v42.DispatchError,
            dispatchInfo: v42.DispatchInfo,
        })
    ),
    /**
     * An extrinsic failed.
     */
    v46: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v46.DispatchError,
            dispatchInfo: v46.DispatchInfo,
        })
    ),
    /**
     * An extrinsic failed.
     */
    v56: new EventType(
        'System.ExtrinsicFailed',
        sts.struct({
            dispatchError: v56.DispatchError,
            dispatchInfo: v56.DispatchInfo,
        })
    ),
}

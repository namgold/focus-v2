import produce from 'immer'
import React, { useEffect, useState } from 'react'
import { useChromeStorageSync } from 'use-chrome-storage'

import Favicon from '../../components/Favicon'
import { DEFAULT, TEMPORARY_DISABLE_TIME, storage } from '../../constants/index'
import { ALERT_TYPE, NOTIFY_TYPE, addKeyBlockWebsites, confirm, getUniques, hasDuplicate, notify } from '../../utils'
import { reset } from '../../utils/helper'
import './options.css'

function Options() {
  let [blockWebsitesStorage, setBlockWebsitesStorage] = useChromeStorageSync<Website[]>(
    'blockWebsites',
    DEFAULT.blockWebsites,
  )
  const [blockWebsitesState, setBlockWebsitesState] = useState(blockWebsitesStorage)
  const [pauseAmount, setPauseAmount] = useChromeStorageSync('pauseAmount', DEFAULT.pauseAmount)
  const [resetAmount, setResetAmount] = useChromeStorageSync('resetAmount', DEFAULT.resetAmount)
  const [newWebsite, setNewWebsite] = useState('')
  const [blockWebsitesChanged, setBlockWebsitesChanged] = useState(0)

  blockWebsitesStorage = blockWebsitesStorage || DEFAULT.blockWebsites // For after reset

  const onChangePauseAmount: React.ChangeEventHandler<HTMLInputElement> = e => {
    // e.preventDefault();
    setPauseAmount(parseInt(e.target.value) || 0)
  }

  const onChangeResetAmount: React.ChangeEventHandler<HTMLInputElement> = e => {
    // e.preventDefault();
    setResetAmount(parseInt(e.target.value) || 0)
  }

  const onChangeWebSite = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // e.preventDefault();
    // blockWebsitesState[blockWebsitesState.findIndex(website => website.url === oldWebsite)].url = e.target.value;
    // setBlockWebsitesState(blockWebsitesState);
    setBlockWebsitesState(
      produce(blockWebsitesState, v => {
        v[index].url = e.target.value
      }),
    )
  }

  const commitBlockWebsites: React.FocusEventHandler<HTMLInputElement> = e => {
    // e.preventDefault();
    setBlockWebsitesStorage(blockWebsitesState)
  }

  const onKeyDownAddWebSite: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.keyCode === 13) {
      // e.preventDefault();
      if (blockWebsitesStorage?.find(blockWebsite => blockWebsite.url === newWebsite)) {
        notify('Block website existed', NOTIFY_TYPE.ERROR)
      } else {
        const newWebsiteRecord: Website = {
          url: newWebsite,
          active: true,
          temporaryDisableTimestamp: 0,
        }
        addKeyBlockWebsites(newWebsiteRecord)
        blockWebsitesStorage.push(newWebsiteRecord)
        setBlockWebsitesStorage(blockWebsitesStorage)
        setNewWebsite('')
      }
    }
  }

  const onChangeAddWebSite: React.ChangeEventHandler<HTMLInputElement> = e => {
    e.preventDefault()
    setNewWebsite(e.target.value)
  }

  const onActivateWebsite = (webURL: string) => {
    const index = blockWebsitesStorage.findIndex(website => website.key === webURL)
    if (!blockWebsitesStorage[index].active) {
      blockWebsitesStorage[index].active = !blockWebsitesStorage[index].active
    } else {
      blockWebsitesStorage[index].temporaryDisableTimestamp = Date.now()
    }
    setBlockWebsitesStorage(blockWebsitesStorage)
  }

  const removeWebsite = (removeWeb: string) => {
    const removeWebsiteIndex = blockWebsitesStorage.findIndex(website => website.url === removeWeb)
    blockWebsitesStorage.splice(removeWebsiteIndex, 1)
    setBlockWebsitesStorage(blockWebsitesStorage)
  }

  useEffect(() => {
    if (blockWebsitesChanged === 1) {
      blockWebsitesStorage.sort((a, b) => (a.active ? 1 : 0) - (b.active ? 1 : 0))
      setBlockWebsitesStorage(blockWebsitesStorage)
    }
    setBlockWebsitesState(blockWebsitesStorage)
    setBlockWebsitesChanged(blockWebsitesChanged + 1)
    if (hasDuplicate(blockWebsitesStorage, blockWebsite => blockWebsite.url)) {
      setBlockWebsitesStorage(getUniques(blockWebsitesStorage))
    }
  }, [blockWebsitesStorage])

  const onReset = async () => {
    const answer = await confirm(
      'Reset confirm',
      'Are you sure to reset all setting? All setting will be lost!',
      ALERT_TYPE.WARNING,
      true,
    )
    if (answer.isConfirmed) {
      reset()
    }
  }

  const onResetTime = async () => {
    const answer = await confirm('Clear timer confirm', 'Are you sure to clear timer?', ALERT_TYPE.WARNING, true)
    if (answer.isConfirmed) {
      storage.get(storageData => {
        storageData.pausedActivated = Object.assign({}, DEFAULT.pausedActivated)
        storage.set(storageData)
      })
    }
  }

  return (
    <div className="option">
      <div className="row" style={{ justifyContent: 'center' }}>
        <h1>FOCUS</h1>
      </div>
      <div className="row mt-3">
        <div
          className="col-xl-4 offset-xl-4 col-lg-6 offset-lg-3 col-md-8 offset-md-2 p-4 pt-3 rounded"
          style={{ backgroundColor: '#212529' }}
        >
          <div className="row">
            <div className="col">
              <label className="w-100">
                Pause Amount (minutes):&nbsp;
                <input
                  id="pauseAmount"
                  className="form-control custom-input"
                  value={pauseAmount}
                  onChange={onChangePauseAmount}
                />
              </label>
            </div>
            <div className="col">
              <label className="w-100">
                Reset Amount (minutes):&nbsp;
                <input
                  id="resetAmount"
                  className="form-control custom-input"
                  value={resetAmount}
                  onChange={onChangeResetAmount}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col">
          <h2>Block Websites:</h2>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-xxl-6 offset-xxl-3 col-xl-8 offset-xl-2 col-md-10 offset-md-1">
          <table className="table table-dark rounded">
            <thead>
              <tr className="align-middle">
                <th scope="col">#</th>
                <th scope="col">Favicon</th>
                <th scope="col">URL</th>
                <th scope="col">Blocked</th>
                <th scope="col">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr className="align-middle">
                <th>Add more</th>
                <td>
                  <Favicon src={newWebsite} />
                </td>
                <td>
                  <input
                    id="new"
                    className="form-control custom-table-input"
                    type="text"
                    value={newWebsite}
                    onChange={onChangeAddWebSite}
                    onKeyDown={onKeyDownAddWebSite}
                  />
                </td>
                <td></td>
                <td></td>
              </tr>
              {blockWebsitesState.map((website, index) => (
                <tr key={website.key} className="align-middle">
                  <th scope="row">{index + 1}</th>
                  <td>
                    <Favicon src={website.url} />
                  </td>
                  <td>
                    <input
                      id={website.key}
                      className="form-control custom-table-input"
                      value={website.url}
                      onChange={e => onChangeWebSite(e, index)}
                      onBlur={commitBlockWebsites}
                    />
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={
                          !website.active
                            ? false
                            : (website.temporaryDisableTimestamp || 0) + TEMPORARY_DISABLE_TIME < Date.now()
                        }
                        onClick={e => (e.preventDefault(), onActivateWebsite(website.url))}
                      />
                      <span className="slider round" />
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={e => (e.preventDefault(), removeWebsite(website.url))}>
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col">
          <button onClick={onReset} className="btn btn-danger">
            Reset settings to default
          </button>
        </div>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="row mt-3">
          <div className="col">
            <button onClick={onResetTime} className="btn btn-danger">
              Clear timer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Options

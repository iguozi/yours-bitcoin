/**
 * MsgInv
 * ======
 *
 * Sends an inventory, or list of "inv" structures, i.e. a list of objects that
 * we have.
 */
'use strict'
let dependencies = {
  Br: require('./br'),
  Bw: require('./bw'),
  Inv: require('./inv'),
  Msg: require('./msg')
}

let inject = function (deps) {
  let Br = deps.Br
  let Bw = deps.Bw
  let Inv = deps.Inv
  let Msg = deps.Msg

  class MsgInv extends Msg {
    initialize () {
      Msg.prototype.initialize.call(this)
      this.setCmd('inv')
      return this
    }

    static dataBufFromInvs (invs) {
      let bw = new Bw()
      bw.writeVarIntNum(invs.length)
      for (let i = 0; i < invs.length; i++) {
        bw.write(invs[i].toBuffer())
      }
      return bw.toBuffer()
    }

    fromInvs (invs) {
      this.setData(MsgInv.dataBufFromInvs(invs))
      return this
    }

    static fromInvs (invs) {
      return new this().fromInvs(invs)
    }

    asyncFromInvs (invs) {
      return this.asyncSetData(MsgInv.dataBufFromInvs(invs))
    }

    static asyncFromInvs (invs) {
      return new this().asyncFromInvs(invs)
    }

    toInvs () {
      let br = new Br(this.dataBuf)
      let len = br.readVarIntNum()
      let invs = []
      for (let i = 0; i < len; i++) {
        let invbuf = br.read(4 + 32)
        let inv = new Inv().fromBuffer(invbuf)
        invs.push(inv)
      }
      return invs
    }

    isValid () {
      return this.getCmd() === 'inv'
    }
  }

  return MsgInv
}

inject = require('injecter')(inject, dependencies)
let MsgInv = inject()
MsgInv.Mainnet = inject({
  Msg: require('./msg').Mainnet
})
MsgInv.Testnet = inject({
  Msg: require('./msg').Testnet
})
module.exports = MsgInv

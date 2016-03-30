import $ from 'jquery';
import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import signals from 'signals';
import 'bootstrap-notify';

const GiftDispatcher = {
  loadGifts: new signals.Signal(),
  changeGift: new signals.Signal()
};

const GiftsActions = {
  loadGifts(gifts) {
    GiftDispatcher.loadGifts.dispatch(gifts);
  },
  changeGift(gift) {
    GiftDispatcher.changeGift.dispatch(gift);
  }
};

const GiftsStore = (function () {
  const self = {};

  const changeSignal = new signals.Signal();

  self.gifts = [];

  GiftDispatcher.loadGifts.add(function (gifts) {
    self.gifts = gifts;
    changeSignal.dispatch();
  });

  GiftDispatcher.changeGift.add(function (gift) {
    saveGiftOnServer(gift);
  });

  self.loadGiftsFromServer = function () {
    $.ajax({
      url: '/api/get.php',
      dataType: 'json',
      cache: false,
      success: function (gifts) {
        GiftsActions.loadGifts(gifts);
      }
    });
  };

  function saveGiftOnServer(gift) {
    $.ajax({
      type: 'POST',
      url: '/api/reserve.php',
      data: JSON.stringify(gift),
      contentType : 'application/json',
      success: function (gifts) {
        GiftsActions.loadGifts(gifts);
        $.notify('Zapisano!', {
          type: 'success',
          delay: 1000,
          placement: {from: 'top', align: 'center'},
          animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
          }
        });
      }
    });
  }

  self.addChangeListener = function (fn) {
    changeSignal.add(fn);
  };

  self.removeChangeListener = function(fn) {
    changeSignal.remove(fn);
  };

  return self;
})();

const GiftsComponent = React.createClass({
  onChange() {
    this.setState({
      gifts: GiftsStore.gifts
    });
  },
  componentDidMount() {
    GiftsStore.addChangeListener(this.onChange);
  },
  componentWillUnmount() {
    GiftsStore.removeChangeListener(this.onChange);
  },
  getInitialState() {
    return {
      gifts: GiftsStore.gifts
    };
  },
  render() {
    return <GiftsTable gifts={this.state.gifts} />
  }
});

const GiftsTable = ({gifts}) => {
  const giftRows = _.map(gifts, gift => {
    return <GiftRow key={gift.name} gift={gift}/>
  });
  return (
    <table className="table table-striped table-bordered table-condensed">
      <thead>
      <tr>
        <th>Nazwa</th>
        <th>Przykład</th>
        <th>Zarezerwowany</th>
      </tr>
      </thead>
      <tbody>
        {giftRows}
      </tbody>
    </table>
  );
};

const GiftRow = React.createClass({
  checkboxChanged() {
    const reserved = ReactDOM.findDOMNode(this.refs.GiftCheckbox).checked;
    const newGift = _.assign({}, this.props.gift);
    newGift.reserved = reserved;
    GiftsActions.changeGift(newGift);
  },
  render() {
    return (
      <tr>
        <td>{this.props.gift.name}</td>
        <td>{this.props.gift.example}</td>
        <td><div className="checkbox no-margin"><label><input type="checkbox" checked={this.props.gift.reserved} onChange={this.checkboxChanged} ref="GiftCheckbox"/>Rezerwacja</label></div></td>
      </tr>
    );
  }
});

$(function () {
  GiftsStore.loadGiftsFromServer();
  setInterval(function () {
    GiftsStore.loadGiftsFromServer();
  }, 2500);
});

export default GiftsComponent;
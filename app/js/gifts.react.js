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
        <th className="text-center">Rezewacja</th>
      </tr>
      </thead>
      <tbody>
        {giftRows}
      </tbody>
    </table>
  );
};

const GiftRow = React.createClass({
  toogleAndSave() {
    const newGift = _.assign({}, this.props.gift);
    newGift.reserved = !this.props.gift.reserved;
    GiftsActions.changeGift(newGift);
  },
  btnClicked() {
    const reserved = this.props.gift.reserved;
    const name = this.props.gift.name;
    const msg = !reserved ? `Czy na pewno chcesz zrobić rezerwację na "${name}"?` : `Czy na pewno chcesz usunąć rezerwację na "${name}"?`;
    if (confirm(msg)) {
      this.toogleAndSave();
    } else {
      // Do nothing!
    }
  },
  render() {
    const reserved = this.props.gift.reserved;
    const btnClass = !reserved ? "btn-primary" : "btn-default";
    const btnText = !reserved ? "Zarezerwuj" : "Usuń";
    const name = !reserved ? this.props.gift.name : <s>{this.props.gift.name}</s>;
    const example = !reserved ? this.props.gift.example : <s>{this.props.gift.example}</s>;
    return (
      <tr>
        <td>{name}</td>
        <td>{example}</td>
        <td className="text-center"><button type="button" className={"btn btn-sm " + btnClass} onClick={this.btnClicked}>{btnText}</button></td>
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
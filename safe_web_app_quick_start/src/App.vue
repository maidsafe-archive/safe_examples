<script>
  const safenetwork = require('./safenetwork.js');
  export default {
    name: 'App',
    data() {
      return { tripText: '', trips: [] }
    },
    methods: {
      refreshList: async function() {
        this.trips = await safenetwork.getItems();
      },
      addTrip: async function() {
        const randomKey = Math.floor((Math.random() * 10000) + 1).toString();
        await safenetwork.insertItem(randomKey, {text: this.tripText, made: false});
        this.tripText = '';
        await this.refreshList();
      },
      remaining: function() {
        var count = 0;
        this.trips.forEach((trip) => {
          count += trip.value.made ? 0 : 1;
        });
        return count;
      },
      remove: async function() {
        let tripsToRemove = []
        await this.trips.forEach(async (trip) => {
          if (trip.value.made) tripsToRemove.push({ key: trip.key, version: trip.version });
        });

        if (tripsToRemove.length > 0) {
          await safenetwork.deleteItems(tripsToRemove);
          await this.refreshList();
        }
      }
    },
    async created() {
      await safenetwork.authoriseAndConnect();
      await safenetwork.createMutableData();
      await this.refreshList();
    }
  };

</script>

<style scoped>
.made-true {
  text-decoration: line-through;
  color: grey;
}
</style>

<template>
  <div :class="$style.App">
    <h1>Hello SAFE Network!</h1>

    <h2>Trips Planner</h2>
    <div>
    <span>{{remaining()}} of {{trips.length}} trips to be made</span>
    [ <a href="" v-on:click.prevent="remove">remove trips already made</a> ]
    <ul class="unstyled">
      <li v-for="trip in trips">
        <label class="checkbox">
          <input type="checkbox" v-model="trip.value.made" />
          <span v-bind:class="{ 'made-true' : trip.value.made }">{{trip.value.text}}</span>
        </label>
      </li>
    </ul>
    <form  v-on:submit.prevent="addTrip">
      <input type="text" v-model="tripText" size="30"
             placeholder="type new trip description here">
      <input class="btn-primary" type="submit" value="Add a trip to the plan">
    </form>

    </div>
  </div>
</template>

<style module>
  .App {
    padding: 20px;
  }
</style>

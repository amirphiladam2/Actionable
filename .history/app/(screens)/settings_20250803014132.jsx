import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'

const settings = () => {
  return (
    <View style={styles.container}>
      <View style={styles.Header}>
        <View style={styles.profileContainer}>
          <Image source={require('../../assets/images/avator.png')}
          style={styles.avator}/>
        </View>
        <Text>Header</Text>
      </View>
      <Text>settings</Text>
    </View>
  )
}

export default settings

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  Header:{
    width:'100%',
    height:120,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor:'lightblue',
  },
  profileContainer:{
    width:70,
    height:70,
    marginLeft:20,
    borderRadius:50,
    marginTop:10,
  },
  avator:{
    fontFamily:'Poppins',
    width:70,
    height:70,
    marginLeft:-10,
    borderRadius:50
  }
})
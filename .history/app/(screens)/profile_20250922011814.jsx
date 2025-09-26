import { StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native'
import React from 'react'

const profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Image 
         source={require('../../assets/images/avator.png')}
         resizeMode='contain'/>
      </View>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  profileImage:{
    width:100
  }
})
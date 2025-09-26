import { StyleSheet, Text, View,Image,TouchableOpacity } from 'react-native'
import React from 'react'

const profile = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image 
         source={require('../../assets/images/avator.png')}
         resizeMode='contain'
         styl/>
        </TouchableOpacity>
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
    height:'100%',
    width:'100%'
  }
})
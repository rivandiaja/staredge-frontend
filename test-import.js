try {
  require('@radix-ui/react-slot');
  console.log('Success: @radix-ui/react-slot found');
} catch (e) {
  console.error('Error: ' + e.message);
}

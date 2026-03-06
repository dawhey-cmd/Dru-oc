import requests
import json
import sys
from datetime import datetime

class OpenClawInstallerTester:
    def __init__(self, base_url="https://34c1d936-ff1e-449a-aebd-ee889b9b6edd.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status=200, data=None, expected_keys=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    if expected_keys:
                        missing_keys = []
                        for key in expected_keys:
                            if key not in response_data:
                                missing_keys.append(key)
                        if missing_keys:
                            print(f"❌ Failed - Missing keys: {missing_keys}")
                            return False, {}
                    
                    self.tests_passed += 1
                    print(f"✅ Passed - Status: {response.status_code}")
                    return True, response_data
                except json.JSONDecodeError:
                    print(f"❌ Failed - Invalid JSON response")
                    return False, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Response text: {response.text}")

            return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test(
            "Health Check", 
            "GET", 
            "api/health", 
            expected_keys=["status", "service"]
        )

    def test_system_check(self):
        """Test system check endpoint (mocked Windows 11 data)"""
        success, response = self.run_test(
            "System Check", 
            "GET", 
            "api/system-check",
            expected_keys=["checks", "passed", "total", "ready"]
        )
        
        if success and response:
            print(f"   - System checks: {response.get('passed')}/{response.get('total')} passed")
            print(f"   - Ready: {response.get('ready')}")
            
            # Verify some checks exist
            checks = response.get('checks', [])
            expected_check_ids = ['os', 'nodejs', 'git', 'disk', 'memory']
            found_checks = [c.get('id') for c in checks]
            
            for check_id in expected_check_ids:
                if check_id in found_checks:
                    print(f"   - ✓ Found {check_id} check")
                else:
                    print(f"   - ❌ Missing {check_id} check")
                    
        return success, response

    def test_skills(self):
        """Test skills endpoint"""
        success, response = self.run_test(
            "Skills", 
            "GET", 
            "api/skills",
            expected_keys=["skills", "categories", "total"]
        )
        
        if success and response:
            skills = response.get('skills', [])
            categories = response.get('categories', [])
            print(f"   - Skills count: {len(skills)}")
            print(f"   - Categories: {len(categories)}")
            
            # Check if we have at least 30 skills as mentioned
            if len(skills) >= 30:
                print(f"   - ✓ Has 30+ skills ({len(skills)} total)")
            else:
                print(f"   - ❌ Expected 30+ skills, got {len(skills)}")
                
            # Check for popular skills
            popular_skills = [s for s in skills if s.get('popular')]
            print(f"   - Popular skills: {len(popular_skills)}")
            
        return success, response

    def test_security_presets(self):
        """Test security presets endpoint"""
        success, response = self.run_test(
            "Security Presets", 
            "GET", 
            "api/security-presets",
            expected_keys=["presets"]
        )
        
        if success and response:
            presets = response.get('presets', {})
            expected_presets = ['standard', 'paranoid', 'permissive']
            
            for preset_id in expected_presets:
                if preset_id in presets:
                    print(f"   - ✓ Found {preset_id} preset")
                else:
                    print(f"   - ❌ Missing {preset_id} preset")
                    
        return success, response

    def test_install_methods(self):
        """Test install methods endpoint"""
        success, response = self.run_test(
            "Install Methods", 
            "GET", 
            "api/install-methods",
            expected_keys=["methods"]
        )
        
        if success and response:
            methods = response.get('methods', [])
            expected_methods = ['npm', 'one-liner', 'hackable']
            found_methods = [m.get('id') for m in methods]
            
            print(f"   - Install methods count: {len(methods)}")
            for method_id in expected_methods:
                if method_id in found_methods:
                    print(f"   - ✓ Found {method_id} method")
                else:
                    print(f"   - ❌ Missing {method_id} method")
                    
        return success, response

    def test_ai_providers(self):
        """Test AI providers endpoint"""
        success, response = self.run_test(
            "AI Providers", 
            "GET", 
            "api/ai-providers",
            expected_keys=["providers"]
        )
        
        if success and response:
            providers = response.get('providers', [])
            expected_count = 5
            
            print(f"   - AI providers count: {len(providers)}")
            if len(providers) >= expected_count:
                print(f"   - ✓ Has {expected_count} providers")
            else:
                print(f"   - ❌ Expected {expected_count} providers, got {len(providers)}")
                
            # Check for specific providers
            provider_ids = [p.get('id') for p in providers]
            expected_providers = ['anthropic', 'openai', 'google']
            
            for provider_id in expected_providers:
                if provider_id in provider_ids:
                    print(f"   - ✓ Found {provider_id} provider")
                else:
                    print(f"   - ❌ Missing {provider_id} provider")
                    
        return success, response

    def test_validate_key(self):
        """Test API key validation endpoint"""
        test_cases = [
            # Valid keys
            {"provider": "anthropic", "key": "sk-ant-api03-test123", "expected_valid": True},
            {"provider": "openai", "key": "sk-proj-test123", "expected_valid": True},
            {"provider": "google", "key": "AIzaSytest123", "expected_valid": True},
            {"provider": "custom", "key": "any-key-here", "expected_valid": True},
            # Invalid keys
            {"provider": "anthropic", "key": "invalid-key", "expected_valid": False},
            {"provider": "openai", "key": "wrong-prefix", "expected_valid": False},
            {"provider": "anthropic", "key": "short", "expected_valid": False},  # Too short
        ]
        
        all_passed = True
        
        for case in test_cases:
            success, response = self.run_test(
                f"Key Validation ({case['provider']} - {case['key'][:15]}...)", 
                "POST", 
                "api/validate-key",
                data={"provider": case['provider'], "key": case['key']},
                expected_keys=["valid", "message"]
            )
            
            if success and response:
                actual_valid = response.get('valid')
                expected_valid = case['expected_valid']
                
                if actual_valid == expected_valid:
                    print(f"   - ✓ Correct validation result: {actual_valid}")
                else:
                    print(f"   - ❌ Expected {expected_valid}, got {actual_valid}")
                    all_passed = False
            else:
                all_passed = False
                
        return all_passed, {}

    def test_save_config(self):
        """Test save configuration endpoint"""
        test_config = {
            "install_method": "npm",
            "install_path": "C:\\Users\\%USERNAME%\\.openclaw", 
            "api_keys": {"anthropic": "sk-ant-test123", "openai": "sk-test456"},
            "security_preset": "standard",
            "selected_skills": ["weather", "github", "discord"],
            "ai_provider": "anthropic",
            "model_name": "claude-sonnet-4-5-20250514"
        }
        
        success, response = self.run_test(
            "Save Config", 
            "POST", 
            "api/save-config",
            data=test_config,
            expected_keys=["session_id", "saved"]
        )
        
        if success and response:
            session_id = response.get('session_id')
            saved = response.get('saved')
            
            if session_id and saved:
                print(f"   - ✓ Config saved with session ID: {session_id}")
            else:
                print(f"   - ❌ Missing session_id or saved flag")
                
        return success, response

    def test_generate_script(self):
        """Test PowerShell script generation endpoint"""
        test_config = {
            "install_method": "npm",
            "install_path": "C:\\Users\\%USERNAME%\\.openclaw",
            "api_keys": {"anthropic": "sk-ant-test123"},
            "security_preset": "standard", 
            "selected_skills": ["weather", "github"],
            "ai_provider": "anthropic",
            "model_name": "claude-sonnet-4-5-20250514"
        }
        
        success, response = self.run_test(
            "Generate Script", 
            "POST", 
            "api/generate-script",
            data=test_config,
            expected_keys=["script", "filename"]
        )
        
        if success and response:
            script = response.get('script', '')
            filename = response.get('filename', '')
            
            # Verify script content
            required_content = [
                'OpenClaw Automatic Installer',
                'PowerShell',
                test_config['install_method'], 
                test_config['security_preset']
            ]
            
            missing_content = []
            for content in required_content:
                if content not in script:
                    missing_content.append(content)
                    
            if missing_content:
                print(f"   - ❌ Missing content in script: {missing_content}")
            else:
                print(f"   - ✓ Script contains all required content")
                
            if filename.endswith('.ps1'):
                print(f"   - ✓ Correct filename: {filename}")
            else:
                print(f"   - ❌ Wrong filename format: {filename}")
                
        return success, response

def main():
    """Run all tests"""
    print("="*60)
    print("🧪 OpenClaw Installer API Testing Suite")
    print("="*60)
    
    tester = OpenClawInstallerTester()
    
    # Run all tests in order
    test_methods = [
        tester.test_health,
        tester.test_system_check,
        tester.test_skills,
        tester.test_security_presets,
        tester.test_install_methods,
        tester.test_ai_providers,
        tester.test_validate_key,
        tester.test_save_config,
        tester.test_generate_script,
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test {test_method.__name__} failed with exception: {e}")
    
    # Test new tool endpoints added in iteration 2
    tester.test_new_tool_endpoints()
    
    # Print results
    print("\n" + "="*60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1
    def test_new_tool_endpoints(self):
        """Test the new tool endpoints added in iteration 2"""
        print("\n" + "="*60)
        print("🔧 TESTING NEW TOOL ENDPOINTS (ITERATION 2)")
        print("="*60)

        # Test Profiles endpoints
        profile_id = None
        try:
            # Create profile
            profile_data = {
                "name": "Test Profile",
                "description": "Testing profile creation",
                "config": {"install_method": "npm", "selected_skills": ["weather"]}
            }
            
            success, data = self.run_test(
                "Create Profile",
                "POST",
                "api/profiles",
                200,
                profile_data,
                ["profile_id", "saved"]
            )
            if success:
                profile_id = data.get("profile_id")
                print(f"   - Created profile: {profile_id}")
            
            # List profiles
            self.run_test("List Profiles", "GET", "api/profiles", 200, None, ["profiles", "total"])
            
            # Delete profile
            if profile_id:
                success, _ = self.run_test(
                    "Delete Profile",
                    "DELETE", 
                    f"api/profiles/{profile_id}",
                    200,
                    None,
                    ["deleted"]
                )
                
        except Exception as e:
            print(f"   ❌ Profile tests failed: {e}")

        # Test Share Config endpoints  
        share_id = None
        try:
            share_data = {
                "config": {"install_method": "npm"},
                "team_name": "Test Team"
            }
            
            success, data = self.run_test(
                "Create Share Link",
                "POST",
                "api/share", 
                200,
                share_data,
                ["share_id", "share_url"]
            )
            if success:
                share_id = data.get("share_id")
                print(f"   - Created share: {share_id}")
            
            # Get shared config
            if share_id:
                self.run_test(
                    "Get Shared Config",
                    "GET",
                    f"api/share/{share_id}",
                    200,
                    None,
                    ["share_id", "config"]
                )
                
        except Exception as e:
            print(f"   ❌ Share config tests failed: {e}")

        # Test Batch endpoints
        try:
            batch_data = {
                "team_name": "Test Team",
                "members": ["user1@test.com", "user2@test.com"],
                "config": {"install_method": "npm"}
            }
            
            self.run_test(
                "Create Batch Install",
                "POST",
                "api/batch",
                200,
                batch_data,
                ["batch_id", "team_name", "members"]
            )
            
            self.run_test("List Batches", "GET", "api/batch", 200, None, ["batches"])
            
        except Exception as e:
            print(f"   ❌ Batch tests failed: {e}")

        # Test Analytics endpoints
        try:
            event_data = {"type": "test_event", "data": {"test": True}}
            self.run_test(
                "Track Analytics Event",
                "POST", 
                "api/analytics/track",
                200,
                event_data,
                ["tracked"]
            )
            
            success, data = self.run_test(
                "Analytics Summary",
                "GET",
                "api/analytics/summary",
                200,
                None,
                ["total_installs", "demo_timeline"]
            )
            
            if success and "demo_timeline" in data:
                timeline = data.get("demo_timeline", [])
                if len(timeline) >= 5:
                    print(f"   ✓ Demo timeline has {len(timeline)} data points")
                    
        except Exception as e:
            print(f"   ❌ Analytics tests failed: {e}")

        # Test Marketplace endpoint
        try:
            success, data = self.run_test(
                "Marketplace Skills",
                "GET",
                "api/marketplace",
                200,
                None,
                ["skills", "total", "ios_available"]
            )
            
            if success:
                total = data.get("total", 0)
                ios_count = data.get("ios_available", 0)
                if total == 12:
                    print(f"   ✓ All 12 marketplace skills returned")
                if ios_count > 0:
                    print(f"   ✓ {ios_count} iOS skills available")
                    
        except Exception as e:
            print(f"   ❌ Marketplace tests failed: {e}")


if __name__ == "__main__":
    sys.exit(main())